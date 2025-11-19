import { Router, Request, Response } from 'express';
import Art from '../models/Art';
import logger from '../utils/logger';

const router = Router();

// Test endpoint to directly create art and test pre-save hook
router.post('/art-hook-test', async (req: Request, res: Response) => {
  try {
    logger.info('Test route: Creating test art');
    
    const testArt = await Art.create({
      title: 'Test Art Hook',
      prompt: 'Test prompt for debugging pre-save hook',
      imageUrl: 'https://example.com/test.jpg',
      createdBy: '682ef04e38adfdf3578a0727' // Using existing user ID
    });

    logger.info('Test route: Art created successfully', { artId: testArt._id, slug: testArt.slug });
    res.json({ success: true, art: testArt });
  } catch (error: any) {
    logger.error('Test route: Error creating art', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
