import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';
import { chatService } from './chatService';
import { MessageSender } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  clientId?: string;
}

class SocketService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  private setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const clientId = socket.handshake.auth.clientId;
        
        if (!clientId) {
          return next(new Error('Client ID required'));
        }

        // For widget connections, we might not require full authentication
        // but we still need to validate the client exists
        socket.clientId = clientId;
        
        if (token) {
          // TODO: Verify JWT token and set userId
          // const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // socket.userId = decoded.userId;
        }

        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`Client connected: ${socket.id}, clientId: ${socket.clientId}`);

      // Join room based on client ID
      if (socket.clientId) {
        socket.join(`client:${socket.clientId}`);
      }

      // Handle chat messages
      socket.on('chat_message', async (data) => {
        try {
          await this.handleChatMessage(socket, data);
        } catch (error) {
          logger.error('Error handling chat message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle joining specific conversation rooms
      socket.on('join_conversation', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.join(`conversation:${conversationId}`);
          logger.info(`Socket ${socket.id} joined conversation: ${conversationId}`);
        }
      });

      // Handle leaving conversation rooms
      socket.on('leave_conversation', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.leave(`conversation:${conversationId}`);
          logger.info(`Socket ${socket.id} left conversation: ${conversationId}`);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.to(`conversation:${conversationId}`).emit('user_typing', {
            userId: socket.userId,
            conversationId,
            isTyping: true,
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        if (conversationId) {
          socket.to(`conversation:${conversationId}`).emit('user_typing', {
            userId: socket.userId,
            conversationId,
            isTyping: false,
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
      });
    });
  }

  private async handleChatMessage(socket: AuthenticatedSocket, data: any) {
    const { conversationId, message, senderName, senderEmail } = data;
    
    if (!socket.clientId) {
      throw new Error('Client ID not found');
    }

    let conversation;
    
    // If no conversation ID provided, create a new conversation
    if (!conversationId) {
      conversation = await chatService.createConversation({
        type: 'CHAT',
        subject: 'Chat via Widget',
        clientId: socket.clientId,
      });
    } else {
      conversation = await chatService.getConversation(conversationId, socket.clientId);
    }

    // Send the message
    const savedMessage = await chatService.sendMessage(conversation.id, {
      content: message,
      sender: MessageSender.USER,
      senderName: senderName || 'Visitante',
      senderEmail,
      isFromAI: false,
    });

    // Emit message to all clients in the conversation room
    this.io.to(`conversation:${conversation.id}`).emit('new_message', {
      message: savedMessage,
      conversationId: conversation.id,
    });

    // Emit message to all admin clients for this client
    this.io.to(`client:${socket.clientId}`).emit('new_message', {
      message: savedMessage,
      conversationId: conversation.id,
    });

    // Send confirmation back to sender
    socket.emit('message_sent', {
      success: true,
      message: savedMessage,
      conversationId: conversation.id,
    });

    // TODO: Trigger AI response if enabled
    // await this.triggerAIResponse(conversation.id, message);
  }

  // Method to send message from admin/agent
  public async sendAdminMessage(conversationId: string, messageData: any) {
    try {
      const message = await chatService.sendMessage(conversationId, messageData);
      
      // Emit to conversation room
      this.io.to(`conversation:${conversationId}`).emit('new_message', {
        message,
        conversationId,
      });

      return message;
    } catch (error) {
      logger.error('Failed to send admin message:', error);
      throw error;
    }
  }

  // Method to send AI response
  public async sendAIResponse(conversationId: string, content: string) {
    try {
      const message = await chatService.sendMessage(conversationId, {
        content,
        sender: MessageSender.AI,
        senderName: 'Assistente IA',
        isFromAI: true,
      });

      // Emit to conversation room
      this.io.to(`conversation:${conversationId}`).emit('ai_response', {
        message,
        conversationId,
      });

      return message;
    } catch (error) {
      logger.error('Failed to send AI response:', error);
      throw error;
    }
  }

  // Method to notify about conversation status changes
  public notifyConversationUpdate(conversationId: string, update: any) {
    this.io.to(`conversation:${conversationId}`).emit('conversation_updated', {
      conversationId,
      update,
    });
  }
}

export { SocketService };