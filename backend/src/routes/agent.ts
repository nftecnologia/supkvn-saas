import { Router } from 'express';
import { z } from 'zod';
import { aiController } from '../controllers/aiController';
import { validate, commonSchemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// All agent routes require authentication
router.use(authenticate);

// AI chat
router.post('/chat',
  validate({
    body: z.object({
      message: z.string().min(1, 'Message is required'),
      clientId: z.string().min(1, 'Client ID is required'),
      conversationHistory: z.array(z.string()).optional(),
    }),
  }),
  aiController.chat
);

// Knowledge base management
router.post('/knowledge/:clientId',
  validate({
    params: z.object({
      clientId: z.string().min(1, 'Client ID is required'),
    }),
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      content: z.string().min(1, 'Content is required'),
      type: z.enum(['FAQ', 'DOCUMENT', 'TEXT', 'URL']),
      source: z.string().optional(),
    }),
  }),
  aiController.addKnowledge
);

router.get('/knowledge/:clientId',
  validate({
    params: z.object({
      clientId: z.string().min(1, 'Client ID is required'),
    }),
    query: commonSchemas.pagination,
  }),
  aiController.getKnowledge
);

router.put('/knowledge/:clientId/:id',
  validate({
    params: z.object({
      clientId: z.string().min(1, 'Client ID is required'),
      id: z.string().min(1, 'Knowledge ID is required'),
    }),
    body: z.object({
      title: z.string().min(1).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(['FAQ', 'DOCUMENT', 'TEXT', 'URL']).optional(),
      source: z.string().optional(),
    }),
  }),
  aiController.updateKnowledge
);

router.delete('/knowledge/:clientId/:id',
  validate({
    params: z.object({
      clientId: z.string().min(1, 'Client ID is required'),
      id: z.string().min(1, 'Knowledge ID is required'),
    }),
  }),
  aiController.deleteKnowledge
);

// Conversation analysis
router.post('/analyze',
  validate({
    body: z.object({
      messages: z.array(z.string()).min(1, 'Messages are required'),
    }),
  }),
  aiController.analyzeConversation
);

export { router as agentRoutes };