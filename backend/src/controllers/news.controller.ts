import { Request, Response, NextFunction } from 'express';
import News, { INews } from '../models/News';

// Get all news (with optional pagination)
export const getAllNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find all news, sort by creation date (newest first)
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'username');
    
    // Count total news for pagination
    const totalNews = await News.countDocuments();
    
    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        total: totalNews,
        page: pageNum,
        pages: Math.ceil(totalNews / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single news by ID
export const getNewsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find news by ID
    const news = await News.findById(id).populate('createdBy', 'username');
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// Create a news post (admin only)
export const createNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content, coverImage, isPublished } = req.body;
    
    // Use the user ID from auth middleware
    const userId = (req as any).user.id;
    
    const news = await News.create({
      title,
      content,
      coverImage: coverImage || '',
      createdBy: userId,
      isPublished: isPublished !== undefined ? isPublished : true
    });
    
    res.status(201).json({
      success: true,
      message: 'News created successfully',
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// Update a news post (admin only)
export const updateNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, coverImage, isPublished } = req.body;
    
    // Find news by ID and update
    const news = await News.findByIdAndUpdate(
      id,
      {
        $set: {
          title: title,
          content: content,
          coverImage: coverImage,
          isPublished: isPublished
        }
      },
      { new: true }
    );
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'News updated successfully',
      data: news
    });
  } catch (error) {
    next(error);
  }
};

// Delete a news post (admin only)
export const deleteNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Find news by ID and delete
    const news = await News.findByIdAndDelete(id);
    
    if (!news) {
      res.status(404).json({
        success: false,
        message: 'News not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get published news for public view (no auth required)
export const getPublishedNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Find only published news
    const news = await News.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'username');
    
    // Count total published news for pagination
    const totalNews = await News.countDocuments({ isPublished: true });
    
    res.status(200).json({
      success: true,
      data: news,
      pagination: {
        total: totalNews,
        page: pageNum,
        pages: Math.ceil(totalNews / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
