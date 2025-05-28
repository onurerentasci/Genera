import { Router } from 'express';
import { 
  getAllNews, 
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews,
  getPublishedNews
} from '../controllers/news.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/public', getPublishedNews);
router.get('/public/:id', getNewsById);

// Protected routes - only admins can access
router.use(verifyToken, isAdmin);

// Admin access only
router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router;
