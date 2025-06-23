import { Router } from 'express';
import { z } from 'zod';
import { chatController } from '../controllers/chatController';
import { validate, chatSchemas, commonSchemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// Conversation routes
router.post('/conversations', 
  validate(chatSchemas.createConversation),
  chatController.createConversation
);

router.get('/conversations/:clientId',
  validate({
    params: commonSchemas.id.extend({
      clientId: commonSchemas.id.shape.id,
    }),
    query: commonSchemas.pagination,
  }),
  chatController.getConversations
);

router.get('/conversations/:id/details',
  validate({
    params: commonSchemas.id,
  }),
  chatController.getConversation
);

router.patch('/conversations/:id/status',
  validate({
    params: commonSchemas.id,
    body: z.object({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED']),
    }),
  }),
  chatController.updateConversationStatus
);

router.delete('/conversations/:id',
  validate({
    params: commonSchemas.id,
  }),
  chatController.deleteConversation
);

// Message routes
router.post('/conversations/:conversationId/messages',
  validate(chatSchemas.sendMessage),
  chatController.sendMessage
);

router.get('/conversations/:conversationId/messages',
  validate(chatSchemas.getMessages),
  chatController.getMessages
);

// Stats routes
router.get('/stats/:clientId',
  validate({
    params: commonSchemas.id.extend({
      clientId: commonSchemas.id.shape.id,
    }),
  }),
  chatController.getStats
);

export { router as chatRoutes };