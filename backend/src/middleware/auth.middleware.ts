import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
    interface Session {
      visited?: boolean;
    }
  }
}

// Verify JWT token middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {  try {
    let token;
    console.log('Auth middleware: Headers authorization:', req.headers.authorization);
    console.log('Auth middleware: Cookies:', req.cookies);
    
    // Get token from header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware: Token from Authorization header');
    } else if (req.cookies.token) {
      token = req.cookies.token;
      console.log('Auth middleware: Token from cookies');
    }
    
    if (!token) {
      console.log('Auth middleware: No token provided');
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'genera-jwt-secret-key-change-in-production';
    console.log('Verifying token with secret:', jwtSecret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, jwtSecret);

    // Ensure decoded token is an object and contains the expected properties
    if (typeof decoded === 'object' && 'id' in decoded) {
      console.log('Auth middleware: Token verified successfully for user:', decoded.id);
      req.user = decoded;
      next();
    } else {
      console.log('Auth middleware: Invalid token structure');
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check if user is admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('isAdmin check - User:', req.user);
  console.log('isAdmin check - User role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin role required'
    });
    return;
  }
};
