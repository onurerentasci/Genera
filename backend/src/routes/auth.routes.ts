import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Protected routes
router.get('/me', verifyToken, getMe);

export default router;
