import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// CSRF Protection
import csrfProtection, { provideCsrfToken, getCsrfToken, conditionalCsrfProtection } from './middleware/csrf.middleware';

// Routes imports
import authRoutes from './routes/auth.routes';
import artRoutes from './routes/art.routes';
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';
import newsRoutes from './routes/news.routes';
import adminArtsRoutes from './routes/admin-arts.routes';
import adminUsersRoutes from './routes/admin-users.routes';
import debugRoutes from './routes/debug.routes';
import statsRoutes from './routes/stats.routes';
import testRoutes from './routes/test.routes';

// Initialize environment variables
dotenv.config();

// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token', 'CSRF-Token', 'X-XSRF-Token'],
  exposedHeaders: ['Set-Cookie']
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'genera-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// CSRF Protection - Apply conditionally to skip public endpoints
// Temporarily disabled for debugging
// app.use(conditionalCsrfProtection);
app.use(provideCsrfToken);

// CSRF token endpoint - needs to be before other routes
app.get('/api/csrf-token', getCsrfToken);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/art', artRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin/news', newsRoutes); // Admin news route
app.use('/api/admin/arts', adminArtsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/test', testRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Genera API is running' });
});

// Global error-handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

export default app;