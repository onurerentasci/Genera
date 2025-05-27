import { Router } from 'express';
import { getUserProfile, getUserGallery, getUserLikedArts } from '../controllers/user.controller';

const router = Router();

// Public routes - no authentication required to view user profiles/galleries
router.get('/:username', getUserProfile);
router.get('/:username/gallery', getUserGallery);
router.get('/:username/liked', getUserLikedArts);

export default router;
