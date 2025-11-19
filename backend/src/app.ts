import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { config } from './config/env.config';
import { TIME } from './constants';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

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

// Create Express app
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token', 'CSRF-Token', 'X-XSRF-Token'],
  exposedHeaders: ['Set-Cookie']
}));

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    maxAge: TIME.ONE_DAY_MS
  }
}));

// CSRF Protection - Apply conditionally to skip public endpoints
app.use(conditionalCsrfProtection);
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

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error-handling middleware
app.use(errorHandler);

export default app;