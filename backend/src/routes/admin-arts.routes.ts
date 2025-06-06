import { Router } from 'express';
import { 
  getAllArts,
  getArtById, 
  deleteArt
} from '../controllers/admin.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Admin art management routes
router.get('/', getAllArts);
router.get('/:id', getArtById);
router.delete('/:id', deleteArt);

export default router;
