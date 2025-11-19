import { Request, Response, NextFunction } from 'express';
import csrf from 'csurf';
import logger from '../utils/logger';

// Extend Request interface for CSRF
declare global {
  namespace Express {
    interface Request {
      csrfToken(): string;
    }
  }
}

// Configure CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    key: '_csrf'
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // Skip CSRF for these methods
  value: (req: Request) => {
    // Try to get CSRF token from different sources
    return req.body._csrf || 
           req.query._csrf || 
           req.headers['csrf-token'] ||
           req.headers['x-csrf-token'] ||
           req.headers['x-xsrf-token'];
  }
});

// Conditional CSRF protection that skips certain public endpoints
export const conditionalCsrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const path = req.path;
  const publicEndpoints = [
    '/api/stats/visit',
    '/api/stats/public',
    '/api/health'
  ];
  
  // Skip CSRF protection for development environment or public endpoints
  if (process.env.NODE_ENV === 'development' || publicEndpoints.includes(path)) {
    logger.debug('Skipping CSRF protection', { method: req.method, path, reason: 'dev mode or public endpoint' });
    next();
  } else {
    logger.debug('Applying CSRF protection', { method: req.method, path });
    csrfProtection(req, res, next);
  }
};

// Middleware to provide CSRF token to client
export const provideCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Add CSRF token to response locals so it can be accessed in routes
  try {
    if (req.csrfToken) {
      res.locals.csrfToken = req.csrfToken();
    }
  } catch (error) {
    logger.error('Error providing CSRF token', { error });
  }
  next();
};

// Route handler to get CSRF token - this needs CSRF protection to generate a token
export const getCsrfToken = [
  csrfProtection,
  (req: Request, res: Response): void => {
    try {
      const token = req.csrfToken();
      res.json({
        success: true,
        csrfToken: token
      });
    } catch (error) {
      logger.error('Error getting CSRF token', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to generate CSRF token'
      });
    }
  }
];

export default csrfProtection;
