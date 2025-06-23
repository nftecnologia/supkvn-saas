import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }

  res.status(500).json({
    error: 'Internal Server Error'
  });
};