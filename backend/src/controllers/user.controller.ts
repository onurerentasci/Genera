import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Art from '../models/Art';
import { NotFoundError } from '../utils/errors';
import { HTTP_STATUS } from '../constants';

// Get user profile by username
export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    
    // Find the user by username
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user gallery (arts created by the user)
export const getUserGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
      // Get arts created by the user
    const arts = await Art.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('title imageUrl slug createdAt likes likesCount comments commentsCount views')
      .populate('createdBy', 'username');
    
    // Count total arts for pagination
    const totalArts = await Art.countDocuments({ createdBy: user._id });
    
    res.status(200).json({
      success: true,
      data: arts,
      pagination: {
        total: totalArts,
        page: pageNum,
        pages: Math.ceil(totalArts / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's liked arts
export const getUserLikedArts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find user by username
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
      // Get arts liked by the user
    const arts = await Art.find({ likes: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('title imageUrl slug createdAt likes likesCount comments commentsCount views')
      .populate('createdBy', 'username');
    
    // Count total liked arts for pagination
    const totalArts = await Art.countDocuments({ likes: user._id });
    
    res.status(200).json({
      success: true,
      data: arts,
      pagination: {
        total: totalArts,
        page: pageNum,
        pages: Math.ceil(totalArts / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
