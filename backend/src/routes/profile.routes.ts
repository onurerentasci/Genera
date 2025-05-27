import { Router } from 'express';
import { updateProfile } from '../controllers/profile.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(verifyToken);

// Update profile route
router.put('/', updateProfile);

export default router;
