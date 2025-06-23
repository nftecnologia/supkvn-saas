import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { ConversationType, ConversationStatus, MessageType, MessageSender } from '@prisma/client';

export interface CreateConversationDto {
  type: ConversationType;
  subject?: string;
  clientId: string;
}

export interface SendMessageDto {
  content: string;
  type?: MessageType;
  sender: MessageSender;
  senderName?: string;
  senderEmail?: string;
  attachments?: any[];
  isFromAI?: boolean;
}

class ChatService {
  async createConversation(data: CreateConversationDto) {
    try {
      const conversation = await prisma.conversation.create({
        data: {
          type: data.type,
          subject: data.subject,
          clientId: data.clientId,
          status: ConversationStatus.OPEN,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      logger.info(`Conversation created: ${conversation.id}`);
      return conversation;
    } catch (error) {
      logger.error('Failed to create conversation:', error);
      throw error;
    }
  }

  async getConversations(clientId: string, page = 1, limit = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;
      
      const where = {
        clientId,
        ...(search && {
          OR: [
            { subject: { contains: search, mode: 'insensitive' as const } },
            {
              messages: {
                some: {
                  content: { contains: search, mode: 'insensitive' as const }
                }
              }
            }
          ]
        })
      };

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          include: {
            client: {
              select: {
                id: true,
                name: true,
                domain: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                content: true,
                sender: true,
                senderName: true,
                createdAt: true,
                type: true,
              },
            },
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.conversation.count({ where }),
      ]);

      return {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get conversations:', error);
      throw error;
    }
  }

  async getConversation(id: string, clientId?: string) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          ...(clientId && { clientId }),
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    } catch (error) {
      logger.error('Failed to get conversation:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, data: SendMessageDto) {
    try {
      // First, verify conversation exists
      const conversation = await this.getConversation(conversationId);
      
      const message = await prisma.message.create({
        data: {
          conversationId,
          content: data.content,
          type: data.type || MessageType.TEXT,
          sender: data.sender,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          isFromAI: data.isFromAI || false,
          attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        },
        include: {
          conversation: {
            select: {
              id: true,
              type: true,
              clientId: true,
            },
          },
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { 
          updatedAt: new Date(),
          status: data.sender === MessageSender.USER ? ConversationStatus.OPEN : ConversationStatus.IN_PROGRESS,
        },
      });

      logger.info(`Message sent in conversation: ${conversationId}`);
      return message;
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
          skip,
          take: limit,
        }),
        prisma.message.count({
          where: { conversationId },
        }),
      ]);

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get messages:', error);
      throw error;
    }
  }

  async updateConversationStatus(id: string, status: ConversationStatus, clientId?: string) {
    try {
      const conversation = await prisma.conversation.update({
        where: {
          id,
          ...(clientId && { clientId }),
        },
        data: {
          status,
          ...(status === ConversationStatus.CLOSED && { closedAt: new Date() }),
        },
      });

      logger.info(`Conversation ${id} status updated to ${status}`);
      return conversation;
    } catch (error) {
      logger.error('Failed to update conversation status:', error);
      throw error;
    }
  }

  async deleteConversation(id: string, clientId?: string) {
    try {
      const conversation = await prisma.conversation.delete({
        where: {
          id,
          ...(clientId && { clientId }),
        },
      });

      logger.info(`Conversation deleted: ${id}`);
      return conversation;
    } catch (error) {
      logger.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  async getConversationStats(clientId: string) {
    try {
      const [total, open, inProgress, closed, todayCount] = await Promise.all([
        prisma.conversation.count({
          where: { clientId },
        }),
        prisma.conversation.count({
          where: { clientId, status: ConversationStatus.OPEN },
        }),
        prisma.conversation.count({
          where: { clientId, status: ConversationStatus.IN_PROGRESS },
        }),
        prisma.conversation.count({
          where: { clientId, status: ConversationStatus.CLOSED },
        }),
        prisma.conversation.count({
          where: {
            clientId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      return {
        total,
        open,
        inProgress,
        closed,
        todayCount,
      };
    } catch (error) {
      logger.error('Failed to get conversation stats:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();