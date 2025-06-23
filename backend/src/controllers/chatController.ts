import { Request, Response } from 'express';
import { chatService } from '../services/chatService';
import { logger } from '../config/logger';
import { ConversationStatus } from '@prisma/client';

class ChatController {
  async createConversation(req: Request, res: Response) {
    try {
      const { type, subject, clientId } = req.body;
      
      const conversation = await chatService.createConversation({
        type,
        subject,
        clientId,
      });
      
      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: { conversation },
      });
    } catch (error: any) {
      logger.error('Create conversation error:', error);
      
      res.status(500).json({
        error: 'Failed to create conversation',
        code: 'CREATE_CONVERSATION_ERROR',
      });
    }
  }

  async getConversations(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query;
      const { clientId } = req.params;
      
      const result = await chatService.getConversations(
        clientId,
        Number(page) || 1,
        Number(limit) || 10,
        search as string
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Get conversations error:', error);
      
      res.status(500).json({
        error: 'Failed to get conversations',
        code: 'GET_CONVERSATIONS_ERROR',
      });
    }
  }

  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { clientId } = req.query;
      
      const conversation = await chatService.getConversation(id, clientId as string);
      
      res.json({
        success: true,
        data: { conversation },
      });
    } catch (error: any) {
      logger.error('Get conversation error:', error);
      
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          error: 'Conversation not found',
          code: 'CONVERSATION_NOT_FOUND',
        });
      }
      
      res.status(500).json({
        error: 'Failed to get conversation',
        code: 'GET_CONVERSATION_ERROR',
      });
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const messageData = req.body;
      
      const message = await chatService.sendMessage(conversationId, messageData);
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message },
      });
    } catch (error: any) {
      logger.error('Send message error:', error);
      
      if (error.message === 'Conversation not found') {
        return res.status(404).json({
          error: 'Conversation not found',
          code: 'CONVERSATION_NOT_FOUND',
        });
      }
      
      res.status(500).json({
        error: 'Failed to send message',
        code: 'SEND_MESSAGE_ERROR',
      });
    }
  }

  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { page, limit } = req.query;
      
      const result = await chatService.getMessages(
        conversationId,
        Number(page) || 1,
        Number(limit) || 50
      );
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Get messages error:', error);
      
      res.status(500).json({
        error: 'Failed to get messages',
        code: 'GET_MESSAGES_ERROR',
      });
    }
  }

  async updateConversationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { clientId } = req.query;
      
      const conversation = await chatService.updateConversationStatus(
        id,
        status as ConversationStatus,
        clientId as string
      );
      
      res.json({
        success: true,
        message: 'Conversation status updated successfully',
        data: { conversation },
      });
    } catch (error: any) {
      logger.error('Update conversation status error:', error);
      
      res.status(500).json({
        error: 'Failed to update conversation status',
        code: 'UPDATE_STATUS_ERROR',
      });
    }
  }

  async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { clientId } = req.query;
      
      await chatService.deleteConversation(id, clientId as string);
      
      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete conversation error:', error);
      
      res.status(500).json({
        error: 'Failed to delete conversation',
        code: 'DELETE_CONVERSATION_ERROR',
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      
      const stats = await chatService.getConversationStats(clientId);
      
      res.json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      logger.error('Get stats error:', error);
      
      res.status(500).json({
        error: 'Failed to get conversation stats',
        code: 'GET_STATS_ERROR',
      });
    }
  }
}

export const chatController = new ChatController();