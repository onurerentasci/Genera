import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';
import { 
  getAllUsers,
  getUserById, 
  updateUserRole,
  deleteUser,
  getUserStats
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Admin user management routes
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
