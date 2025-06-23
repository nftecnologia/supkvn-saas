import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../config/logger';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const user = await authService.verifyToken(token);
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await authService.verifyToken(token);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail if token is invalid
    logger.warn('Optional authentication failed:', error);
    next();
  }
};