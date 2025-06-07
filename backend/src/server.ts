import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import SocketService from './services/socket.service';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket.IO
  const socketService = new SocketService(server);
  console.log('✅ Socket.IO initialized');
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Online users tracking enabled`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});