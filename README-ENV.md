# Genera Project Environment Setup

This document explains how to set up environment variables for the Genera project.

## Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the required values:

```bash
cp backend/.env.example backend/.env
```

### Required Variables:

- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Environment mode (development/production)
- **MONGO_URI**: MongoDB connection string
- **JWT_SECRET**: Secret key for JWT tokens (generate a strong random string)
- **JWT_EXPIRE**: JWT token expiration time
- **FRONTEND_URL**: Frontend URL for CORS configuration
- **SESSION_SECRET**: Secret key for sessions (generate a strong random string)
- **HUGGINGFACE_TOKEN**: Your Hugging Face API token

## Frontend Environment Variables

Copy `frontend/.env.local.example` to `frontend/.env.local` and fill in the required values:

```bash
cp frontend/.env.local.example frontend/.env.local
```

### Required Variables:

- **NEXT_PUBLIC_API_URL**: Backend API URL
- **NEXT_PUBLIC_FRONTEND_URL**: Frontend URL
- **HF_ACCESS_TOKEN**: Hugging Face token (if used in frontend)

## Getting API Keys

### Hugging Face Token
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with appropriate permissions
3. Copy the token to your environment files

## Security Notes

- Never commit `.env` files to Git
- Use strong, random secrets for JWT_SECRET and SESSION_SECRET
- For production, use environment-specific URLs and stronger secrets
- Keep your API tokens secure and rotate them regularly

## Development Setup

1. Clone the repository
2. Set up environment variables as described above
3. Install dependencies in both backend and frontend directories
4. Start MongoDB service
5. Run the development servers
