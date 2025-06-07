import { Router } from 'express';
import { trackVisit, getStats, getAnalytics } from '../controllers/stats.controller';
import { verifyToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route - ziyaret sayacı
router.post('/visit', trackVisit);

// Public route - genel istatistikler
router.get('/public', getStats);

// Admin route - detaylı analitikler
router.get('/analytics', verifyToken, isAdmin, getAnalytics);

export default router;
