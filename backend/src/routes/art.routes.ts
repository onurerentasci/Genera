import { Router } from 'express';
import { 
  generateArt, 
  submitArt, 
  likeArt, 
  unlikeArt, 
  addComment, 
  getArtById, 
  trackView,
  deleteComment
} from '../controllers/art.controller';
import { verifyToken } from '../middleware/auth.middleware';
import Art from '../models/Art';

const router = Router();

// Generate art (mock)
router.post('/generate', verifyToken, generateArt);

// Submit art
router.post('/submit', verifyToken, submitArt);

// Like and unlike art
router.post('/like/:artId', verifyToken, likeArt);
router.delete('/like/:artId', verifyToken, unlikeArt);

// Comments
router.post('/comment/:artId', verifyToken, addComment);
router.delete('/comment/:commentId', verifyToken, deleteComment);

// Timeline route
router.get('/timeline', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);    const arts = await Art.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'username');

    const total = await Art.countDocuments();

    res.status(200).json({
      success: true,
      data: arts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timeline' });  }
});

// Views
router.post('/:artId/view', trackView);

// Get art details (including comments, likes, and incrementing view count)
router.get('/:artId', getArtById);

export default router;
