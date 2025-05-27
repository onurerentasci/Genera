import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Update user profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bio, profileImage } = req.body;
    
    // Find user by ID (set by auth middleware)
    const userId = (req as any).user.id;
    
    // Update fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          bio: bio || '',
          profileImage: profileImage || ''
        }
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
