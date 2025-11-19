// API Request/Response Types

export interface GenerateArtRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'anime' | 'abstract';
}

export interface GenerateArtResponse {
  success: boolean;
  imageUrl: string;
  message: string;
  warning?: string;
}

export interface SubmitArtRequest {
  title: string;
  prompt: string;
  imageUrl: string;
}

export interface Art {
  _id: string;
  title: string;
  slug: string;
  prompt: string;
  imageUrl: string;
  createdBy: string | User;
  createdAt: string;
  likes: string[];
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  views: number;
}

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  profileImage?: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  createdBy: string | User;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  details?: any;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Stats Types
export interface Stats {
  totalVisitors: number;
  onlineUsers: number;
  totalArts: number;
  totalUsers: number;
}

export interface OnlineUser {
  id: string;
  username: string;
  joinedAt: Date;
}
