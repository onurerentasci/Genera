import { Request, Response } from 'express';
import Art from '../models/Art';

// Generate art (mock implementation)
export const generateArt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    // Generate a dynamic image URL based on the prompt
    const mockImageUrl = `https://placehold.co/600x400.png?text=${encodeURIComponent(prompt)}`;

    res.status(200).json({ success: true, imageUrl: mockImageUrl });
  } catch (error) {
    console.error('Error generating art:', error);
    res.status(500).json({ success: false, message: 'Failed to generate art' });
  }
};

// Submit art
export const submitArt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, prompt, imageUrl } = req.body;
    const userId = req.user.id;

    const newArt = await Art.create({
      title,
      prompt,
      imageUrl,
      createdBy: userId,
    });

    res.status(201).json({ success: true, art: newArt });
  } catch (error) {
    console.error('Error submitting art:', error);
    res.status(500).json({ success: false, message: 'Failed to submit art' });
  }
};
