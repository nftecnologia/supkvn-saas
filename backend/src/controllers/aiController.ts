import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { logger } from '../config/logger';

class AIController {
  async chat(req: Request, res: Response) {
    try {
      const { message, clientId, conversationHistory } = req.body;
      
      const response = await aiService.generateResponse(
        message,
        clientId,
        conversationHistory
      );
      
      res.json({
        success: true,
        data: { response },
      });
    } catch (error: any) {
      logger.error('AI chat error:', error);
      
      res.status(500).json({
        error: 'Failed to generate AI response',
        code: 'AI_CHAT_ERROR',
      });
    }
  }

  async addKnowledge(req: Request, res: Response) {
    try {
      const { title, content, type, source } = req.body;
      const { clientId } = req.params;
      
      const knowledge = await aiService.addKnowledge(clientId, {
        title,
        content,
        type,
        source,
      });
      
      res.status(201).json({
        success: true,
        message: 'Knowledge added successfully',
        data: { knowledge },
      });
    } catch (error: any) {
      logger.error('Add knowledge error:', error);
      
      res.status(500).json({
        error: 'Failed to add knowledge',
        code: 'ADD_KNOWLEDGE_ERROR',
      });
    }
  }

  async getKnowledge(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const knowledge = await aiService.getClientKnowledge(clientId);
      
      // Simple pagination
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedKnowledge = knowledge.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: {
          knowledge: paginatedKnowledge,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: knowledge.length,
            pages: Math.ceil(knowledge.length / Number(limit)),
          },
        },
      });
    } catch (error: any) {
      logger.error('Get knowledge error:', error);
      
      res.status(500).json({
        error: 'Failed to get knowledge',
        code: 'GET_KNOWLEDGE_ERROR',
      });
    }
  }

  async updateKnowledge(req: Request, res: Response) {
    try {
      const { id, clientId } = req.params;
      const updates = req.body;
      
      const knowledge = await aiService.updateKnowledge(id, clientId, updates);
      
      res.json({
        success: true,
        message: 'Knowledge updated successfully',
        data: { knowledge },
      });
    } catch (error: any) {
      logger.error('Update knowledge error:', error);
      
      res.status(500).json({
        error: 'Failed to update knowledge',
        code: 'UPDATE_KNOWLEDGE_ERROR',
      });
    }
  }

  async deleteKnowledge(req: Request, res: Response) {
    try {
      const { id, clientId } = req.params;
      
      await aiService.deleteKnowledge(id, clientId);
      
      res.json({
        success: true,
        message: 'Knowledge deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete knowledge error:', error);
      
      res.status(500).json({
        error: 'Failed to delete knowledge',
        code: 'DELETE_KNOWLEDGE_ERROR',
      });
    }
  }

  async analyzeConversation(req: Request, res: Response) {
    try {
      const { messages } = req.body;
      
      const analysis = await aiService.analyzeConversation(messages);
      
      res.json({
        success: true,
        data: { analysis },
      });
    } catch (error: any) {
      logger.error('Analyze conversation error:', error);
      
      res.status(500).json({
        error: 'Failed to analyze conversation',
        code: 'ANALYZE_CONVERSATION_ERROR',
      });
    }
  }
}

export const aiController = new AIController();