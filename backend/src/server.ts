import app from './app';
import mongoose from 'mongoose';
import { createServer } from 'http';
import SocketService from './services/socket.service';
import { config } from './config/env.config';
import logger from './utils/logger';

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', { error });
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket.IO
  const socketService = new SocketService(server);
  logger.info('Socket.IO initialized');
  
  server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
    logger.info('Online users tracking enabled');
  });
};

startServer().catch(err => {
  logger.error('Failed to start server', { error: err });
});