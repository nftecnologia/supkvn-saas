import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';
import { database } from './config/database';
// import { redisClient } from './config/redis';
import { SocketService } from './services/socketService';

// Import routes
import { authRoutes } from './routes/auth';
import { chatRoutes } from './routes/chat';
import { agentRoutes } from './routes/agent';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.WIDGET_URL || 'http://localhost:3001',
      'http://localhost:3000' // Allow same origin
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Initialize services
const socketService = new SocketService(io);

// Middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for widget
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.WIDGET_URL || 'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agent', agentRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'UP' : 'DOWN',
        redis: 'DISABLED', // Disabled for now
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString() 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
  });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await database.disconnect();
    // await redisClient.disconnect();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Connect to Redis (disabled for development)
    // await redisClient.connect();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io, socketService };