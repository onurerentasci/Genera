import { Router, Request, Response } from 'express';
import Art from '../models/Art';

const router = Router();

// Test endpoint to directly create art and test pre-save hook
router.post('/art-hook-test', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Test route: Creating test art...');
    
    const testArt = await Art.create({
      title: 'Test Art Hook',
      prompt: 'Test prompt for debugging pre-save hook',
      imageUrl: 'https://example.com/test.jpg',
      createdBy: '682ef04e38adfdf3578a0727' // Using existing user ID
    });

    console.log('🧪 Test route: Art created successfully:', testArt);
    res.json({ success: true, art: testArt });
  } catch (error: any) {
    console.error('🧪 Test route: Error creating art:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
