import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../utils/logger';
import { config } from '../config/env.config';

interface JwtPayload {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
    interface Session {
      visited?: boolean;
    }
  }
}

// Verify JWT token middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    
    // Get token from header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token attempt', { error: error.message });
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired token attempt', { error: error.message });
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    
    logger.error('Auth middleware error', { error });
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn('Unauthorized admin access attempt', { userId: req.user?.id });
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin role required'
    });
    return;
  }
};
