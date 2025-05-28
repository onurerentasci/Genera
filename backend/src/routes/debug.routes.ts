import { Router, Request, Response } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();

// Debug route to check token
router.get('/token-check', (req: Request, res: Response): void => {
  try {
    // Get token from headers or cookies
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(200).json({
        success: false,
        message: 'No token provided',
        headers: req.headers,
        cookies: req.cookies
      });
      return;
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret');
      res.status(200).json({
        success: true,
        message: 'Token is valid',
        decoded,
        headers: {
          authorization: req.headers.authorization
        },
        cookies: {
          token: req.cookies.token
        }
      });
      return;
    } catch (jwtError) {
      res.status(200).json({
        success: false,
        message: 'Invalid token',
        error: (jwtError as Error).message,
        headers: {
          authorization: req.headers.authorization
        },
        cookies: {
          token: req.cookies.token
        }
      });
      return;
    }  } catch (error) {
    console.error('Debug token check error:', error);
    res.status(500).json({ success: false, message: 'Error checking token' });
  }
});

// Admin check route - checks if user has admin privileges
router.get('/admin-check', verifyToken, isAdmin, (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'User has admin privileges',
    user: req.user
  });
});

export default router;
