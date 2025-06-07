import { Request, Response } from 'express';
import Art from '../models/Art';
import mongoose from 'mongoose';

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
    console.log("Backend: submitArt called with body:", req.body);
    console.log("Backend: User from token:", req.user);
    
    const { title, prompt, imageUrl } = req.body;
    const userId = req.user.id;

    if (!title || !prompt || !imageUrl) {
      console.log("Backend: Missing required fields:", { title, prompt, imageUrl });
      res.status(400).json({ success: false, message: 'Title, prompt, and imageUrl are required' });
      return;
    }    console.log("Backend: Creating new art with data:", { title, prompt, imageUrl, userId });

    console.log("🚨 Backend: About to create new Art document...");
    // Create new art document using new + save pattern to ensure pre-save hooks run
    const newArt = new Art({
      title,
      prompt,
      imageUrl,
      createdBy: userId,
    });

    console.log("🚨 Backend: About to call save()...");
    // Save the document (this will trigger the pre-save hook)
    const savedArt = await newArt.save();

    console.log("🚨 Backend: Art.save() completed successfully!");
    console.log("🚨 Backend: Saved art:", JSON.stringify(savedArt, null, 2));

    console.log("Backend: Art created successfully:", savedArt);
    res.status(201).json({ success: true, art: savedArt });
  } catch (error: any) {
    console.error('Backend: Error submitting art:', error);
    
    // Provide more detailed error information
    if (error.name === 'ValidationError') {
      console.error('Backend: Validation error details:', error.errors);
      res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        details: error.errors 
      });
    } else if (error.code === 11000) {
      console.error('Backend: Duplicate key error:', error.keyPattern);
      res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry', 
        details: error.keyPattern 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit art',
        error: error.message 
      });
    }
  }
};

// Like art
export const likeArt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      res.status(400).json({ success: false, message: 'Invalid art ID' });
      return;
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }

    // Check if user already liked this art
    const alreadyLiked = art.likes.includes(userId);
    
    if (alreadyLiked) {
      res.status(400).json({ success: false, message: 'Art already liked by this user' });
      return;
    }

    // Add user to likes array and increment likesCount
    art.likes.push(userId);
    art.likesCount = art.likes.length;
    
    await art.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Art liked successfully',
      likesCount: art.likesCount
    });
  } catch (error) {
    console.error('Error liking art:', error);
    res.status(500).json({ success: false, message: 'Failed to like art' });
  }
};

// Unlike art
export const unlikeArt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      res.status(400).json({ success: false, message: 'Invalid art ID' });
      return;
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }

    // Check if user already liked this art
    const likeIndex = art.likes.findIndex(id => id.toString() === userId);
    
    if (likeIndex === -1) {
      res.status(400).json({ success: false, message: 'Art not liked by this user' });
      return;
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
    console.error('Error unliking art:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike art' });
  }
};

// Add comment to art
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === '') {
      res.status(400).json({ success: false, message: 'Comment text is required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(artId)) {
      res.status(400).json({ success: false, message: 'Invalid art ID' });
      return;
    }

    const art = await Art.findById(artId);
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Art not found' });
      return;
    }

    // Add comment to art
    const newComment = {
      text,
      createdBy: userId,
      createdAt: new Date()
    };

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
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
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
    console.error('Error getting art details:', error);
    res.status(500).json({ success: false, message: 'Failed to get art details' });
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
    const art = await Art.findByIdAndUpdate(
      artId, 
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
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view' });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ success: false, message: 'Invalid comment ID' });
      return;
    }

    // Find the art containing the comment
    const art = await Art.findOne({
      'comments._id': commentId
    });
    
    if (!art) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }    // Find the comment
    const commentIndex = art.comments.findIndex(
      comment => {
        // Check if _id exists and is valid before comparing
        return comment._id && comment._id.toString() === commentId;
      }
    );

    if (commentIndex === -1) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
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
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};
