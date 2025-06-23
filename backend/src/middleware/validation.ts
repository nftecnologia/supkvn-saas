import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../config/logger';

export const validate = (schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        logger.warn('Validation failed:', { errors: errorMessages, url: req.url });

        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: errorMessages,
        });
      }

      logger.error('Unexpected validation error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  id: z.object({
    id: z.string().min(1, 'ID is required'),
  }),

  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
  }),

  email: z.string().email('Invalid email format'),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),

  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
};

// Auth validation schemas
export const authSchemas = {
  register: {
    body: z.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      name: commonSchemas.name,
    }),
  },

  login: {
    body: z.object({
      email: commonSchemas.email,
      password: z.string().min(1, 'Password is required'),
    }),
  },

  refreshToken: {
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required'),
    }),
  },

  forgotPassword: {
    body: z.object({
      email: commonSchemas.email,
    }),
  },

  resetPassword: {
    body: z.object({
      token: z.string().min(1, 'Reset token is required'),
      password: commonSchemas.password,
    }),
  },
};

// Chat validation schemas
export const chatSchemas = {
  createConversation: {
    body: z.object({
      type: z.enum(['CHAT', 'EMAIL']),
      subject: z.string().optional(),
      clientId: z.string().min(1, 'Client ID is required'),
    }),
  },

  sendMessage: {
    params: z.object({
      conversationId: z.string().min(1, 'Conversation ID is required'),
    }),
    body: z.object({
      content: z.string().min(1, 'Message content is required'),
      type: z.enum(['TEXT', 'FILE', 'IMAGE', 'AUDIO', 'VIDEO']).default('TEXT'),
      sender: z.enum(['USER', 'AGENT', 'AI', 'SYSTEM']).default('USER'),
      senderName: z.string().optional(),
      senderEmail: z.string().email().optional(),
      attachments: z.array(z.any()).optional(),
    }),
  },

  getMessages: {
    params: z.object({
      conversationId: z.string().min(1, 'Conversation ID is required'),
    }),
    query: commonSchemas.pagination,
  },
};

// Client validation schemas
export const clientSchemas = {
  updateProfile: {
    body: z.object({
      name: z.string().min(1, 'Name is required').optional(),
      domain: z.string().optional(),
      website: z.string().url('Invalid website URL').optional(),
    }),
  },

  updateSettings: {
    body: z.object({
      key: z.string().min(1, 'Setting key is required'),
      value: z.any(),
      type: z.enum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY']).default('STRING'),
    }),
  },
};