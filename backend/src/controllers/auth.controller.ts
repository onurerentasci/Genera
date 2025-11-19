import { Request, Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import User, { IUser } from '../models/User';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { HTTP_STATUS } from '../constants';
import logger from '../utils/logger';

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      throw new ValidationError('A user with this email or username already exists');
    }

    // Create new user
    const user: HydratedDocument<IUser> = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = user.generateAuthToken();

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Register error', { error });
    throw error;
  }
};

// Login user
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user: HydratedDocument<IUser> | null = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = user.generateAuthToken();    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Login error', { error });
    throw error;
  }
};

// Get current user profile
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.user is set by the auth middleware
    const user: HydratedDocument<IUser> | null = await User.findById((req as any).user.id);

    if (!user) {
      throw new NotFoundError('User not found');
    }    res.status(HTTP_STATUS.OK).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get me error', { error });
    throw error;
  }
};
