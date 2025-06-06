import { Request, Response, NextFunction } from 'express';
import Art from '../models/Art';
import User from '../models/User';
import mongoose from 'mongoose';

// Get all arts with pagination (admin only)
export const getAllArts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find all arts, sort by creation date (newest first)
    const arts = await Art.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'username');
    
    // Count total arts for pagination
    const totalArts = await Art.countDocuments();
    
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

// Get a specific art by ID (admin only)
export const getArtById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find art by ID or slug
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }
    
    // Find and populate art details
    const art = await Art.findOne(query)
      .populate('createdBy', 'username email')
      .populate('comments.createdBy', 'username');
    
    if (!art) {
      res.status(404).json({
        success: false,
        message: 'Art not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: art
    });
  } catch (error) {
    next(error);
  }
};

// Delete an art post (admin only)
export const deleteArt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find art by ID and delete
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }
    
    const art = await Art.findOneAndDelete(query);
    
    if (!art) {
      res.status(404).json({
        success: false,
        message: 'Art not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Art deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all users with pagination (admin only)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Find all users, sort by creation date (newest first)
    const users = await User.find(searchQuery)
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Get user stats (arts count and likes count) for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const artsCount = await Art.countDocuments({ createdBy: user._id });
        const likesCount = await Art.aggregate([
          { $match: { createdBy: user._id } },
          { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
        ]);
        
        return {
          ...user.toObject(),
          artsCount,
          likesCount: likesCount.length > 0 ? likesCount[0].totalLikes : 0
        };
      })
    );
    
    // Count total users for pagination
    const totalUsers = await User.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        total: totalUsers,
        page: pageNum,
        pages: Math.ceil(totalUsers / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific user by ID (admin only)
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Get user stats
    const artsCount = await Art.countDocuments({ createdBy: user._id });
    const likesCount = await Art.aggregate([
      { $match: { createdBy: user._id } },
      { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
    ]);
    
    const userWithStats = {
      ...user.toObject(),
      artsCount,
      likesCount: likesCount.length > 0 ? likesCount[0].totalLikes : 0
    };
    
    res.status(200).json({
      success: true,
      data: userWithStats
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }
    
    if (!['user', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin"'
      });
      return;
    }
    
    // Prevent admin from demoting themselves
    if (req.user && req.user.id === id && role === 'user') {
      res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user (admin only)
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
      return;
    }
    
    // Prevent admin from deleting themselves
    if (req.user && req.user.id === id) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
      return;
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Also delete all arts created by this user
    await Art.deleteMany({ createdBy: id });
    
    res.status(200).json({
      success: true,
      message: 'User and associated content deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user statistics (admin only)
export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminUsers,
        regularUsers,
        newUsers
      }
    });
  } catch (error) {
    next(error);
  }
};
