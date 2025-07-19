import mongoose from 'mongoose';
import { config } from './config';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = config.nodeEnv === 'test' ? config.mongodbTestUri : config.mongodbUri;
    
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 6+ doesn't need most options, they're defaults
    });

    logger.success(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.success('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};
