import { Request, Response } from 'express';
import Art, { IComment } from '../models/Art';
import mongoose from 'mongoose';
import HuggingFaceService from '../services/huggingface.service';
import logger from '../utils/logger';
import { ValidationError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { HTTP_STATUS } from '../constants';

// Generate art using Hugging Face Stable Diffusion
export const generateArt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, style } = req.body;

    if (!prompt || prompt.trim() === '') {
      throw new ValidationError('Prompt is required');
    }

    logger.debug('Generating image for prompt', { promptLength: prompt.length, hasStyle: !!style });

    try {
      // Create Hugging Face service instance
      const huggingFaceService = new HuggingFaceService();
      
      // Generate image using Hugging Face service
      const filename = style 
        ? await huggingFaceService.generateImageWithStyle(prompt, style)
        : await huggingFaceService.generateImage(prompt);
      
      // Create public URL for the image
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      
      logger.info('Image generated successfully', { filename });
      
      res.status(200).json({ 
        success: true, 
        imageUrl: imageUrl,
        message: 'Image generated successfully using AI'
      });
    } catch (hfError) {
      const errorMessage = hfError instanceof Error ? hfError.message : 'Unknown error';
      logger.error('Hugging Face generation error', { error: errorMessage });
      
      // Provide more specific error messages to the user
      let userMessage = 'AI generation temporarily unavailable';
      if (errorMessage.includes('quota')) {
        userMessage = 'AI service quota exceeded. Please try again later.';
      } else if (errorMessage.includes('loading')) {
        userMessage = 'AI model is loading. Please try again in a few moments.';
      }
      
      // Fallback to placeholder if HF fails
      const fallbackImageUrl = `https://placehold.co/512x512/6366f1/ffffff.png?text=${encodeURIComponent(prompt)}`;
      res.status(200).json({ 
        success: true, 
        imageUrl: fallbackImageUrl,
        message: 'Generated using fallback service',
        warning: userMessage
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error generating art', { error: errorMessage });
    
    // Final fallback
    const { prompt } = req.body;
    const fallbackImageUrl = `https://placehold.co/512x512/6366f1/ffffff.png?text=${encodeURIComponent(prompt || 'Art')}`;
    
    res.status(200).json({ 
      success: true, 
      imageUrl: fallbackImageUrl,
      message: 'Generated using fallback service',
      warning: 'AI generation temporarily unavailable'
    });
  }
};

// Submit art
export const submitArt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { title, prompt, imageUrl } = req.body;
    const userId = req.user.id;

    if (!title || !prompt || !imageUrl) {
      throw new ValidationError('Title, prompt, and imageUrl are required');
    }

    // Create new art document using new + save pattern to ensure pre-save hooks run
    const newArt = new Art({
      title,
      prompt,
      imageUrl,
      createdBy: userId,
    });

    // Save the document (this will trigger the pre-save hook)
    const savedArt = await newArt.save();

    logger.info('Art created successfully', { artId: savedArt._id, userId });
    res.status(201).json({ success: true, art: savedArt });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error submitting art', { error: errorMessage });
    
    // Provide more detailed error information
    if (error && typeof error === 'object') {
      if ('name' in error && error.name === 'ValidationError') {
        res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          details: 'errors' in error ? error.errors : undefined
        });
        return;
      }
      
      if ('code' in error && error.code === 11000) {
        res.status(400).json({ 
          success: false, 
          message: 'Duplicate entry', 
          details: 'keyPattern' in error ? error.keyPattern : undefined
        });
        return;
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit art',
      error: errorMessage
    });
  }
};

// Like art
export const likeArt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { artId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      throw new ValidationError('Invalid art ID format');
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }

    // Check if user already liked this art
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = art.likes.some(like => like.toString() === userId);
    
    if (alreadyLiked) {
      throw new ValidationError('Art already liked by this user');
    }

    // Add user to likes array and increment likesCount
    art.likes.push(userObjectId as any as mongoose.Schema.Types.ObjectId);
    art.likesCount = art.likes.length;
    
    await art.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Art liked successfully',
      likesCount: art.likesCount
    });
  } catch (error) {
    logger.error('Error liking art', { error });
    throw error;
  }
};

// Unlike art
export const unlikeArt = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { artId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      throw new ValidationError('Invalid art ID format');
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }

    // Check if user already liked this art
    const likeIndex = art.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      throw new ValidationError('Art not liked by this user');
    }

    // Remove user from likes array and update likesCount
    art.likes.splice(likeIndex, 1);
    art.likesCount = art.likes.length;
    
    await art.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Art unliked successfully',
      likesCount: art.likesCount
    });
  } catch (error) {
    logger.error('Error unliking art', { error });
    throw error;
  }
};

// Add comment to art
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { artId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      throw new ValidationError('Comment text is required');
    }

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      throw new ValidationError('Invalid art ID format');
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      throw new NotFoundError('Art not found');
    }

    // Add comment
    const newComment = {
      text,
      createdBy: new mongoose.Types.ObjectId(userId) as any as mongoose.Schema.Types.ObjectId,
      createdAt: new Date()
    } as IComment;

    art.comments.push(newComment);
    art.commentsCount = art.comments.length;
    
    await art.save();
      // Populate the user details for the created comment
    const populatedArt = await Art.findById(artId)
      .populate({
        path: 'comments.createdBy',
        select: 'username'
      });
    
    if (!populatedArt) {
      res.status(404).json({ success: false, message: 'Art not found after adding comment' });
      return;
    }
    
    // Get the newly added comment (last one)
    const addedComment = populatedArt.comments[populatedArt.comments.length - 1];
    
    res.status(201).json({ 
      success: true, 
      message: 'Comment added successfully',
      comment: addedComment,
      commentsCount: art.commentsCount
    });
  } catch (error) {
    logger.error('Error adding comment', { error });
    throw error;
  }
};

// Get art by ID or slug with details (including comments, likes, views)
export const getArtById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artId } = req.params;
    
    let query;
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(artId)) {
      query = { _id: artId };
    } else {
      // Otherwise, treat it as a slug
      query = { slug: artId };
    }

    // Find art and increment view count
    const art = await Art.findOneAndUpdate(
      query, 
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('createdBy', 'username')
    .populate('comments.createdBy', 'username')
    .populate('likes', 'username');
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      data: art
    });
  } catch (error) {
    logger.error('Error getting art details', { error });
    throw error;
  }
};

// Track view for an art piece
export const trackView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artId } = req.params;
    
    let query;
    
    // Check if it's a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(artId)) {
      query = { _id: artId };
    } else {
      // Otherwise, treat it as a slug
      query = { slug: artId };
    }

    // Increment view count
    const art = await Art.findOneAndUpdate(
      query, 
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      views: art.views
    });
  } catch (error) {
    logger.error('Error tracking view', { error });
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      throw new ValidationError('Invalid comment ID format');
    }

    // Find the art containing the comment
    const art = await Art.findOne({
      'comments._id': commentId
    });
    
    if (!art) {
      throw new NotFoundError('Comment not found');
    }    // Find the comment
    const commentIndex = art.comments.findIndex(
      comment => {
        // Check if _id exists and is valid before comparing
        return comment._id && comment._id.toString() === commentId;
      }
    );

    if (commentIndex === -1) {
      throw new NotFoundError('Comment not found');
    }

    const comment = art.comments[commentIndex];

    // Check if the user is the comment owner or an admin
    if (comment.createdBy.toString() !== userId && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
      return;
    }    // Remove the comment
    art.comments = art.comments.filter(
      (comment, index) => index !== commentIndex
    );
    art.commentsCount = art.comments.length;
    
    await art.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully',
      commentsCount: art.commentsCount
    });
  } catch (error) {
    logger.error('Error deleting comment', { error });
    throw error;
  }
};
