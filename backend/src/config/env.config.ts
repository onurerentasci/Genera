import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  SESSION_SECRET: string;
  FRONTEND_URL: string;
  HUGGINGFACE_TOKEN: string;
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variable is missing
 */
export const validateEnv = (): EnvConfig => {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'HUGGINGFACE_TOKEN'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See README-ENV.md for more information.');
    process.exit(1);
  }

  // Validate secret strength
  const jwtSecret = process.env.JWT_SECRET!;
  const sessionSecret = process.env.SESSION_SECRET!;

  if (jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (sessionSecret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGO_URI!;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.error('❌ MONGO_URI must be a valid MongoDB connection string');
    process.exit(1);
  }

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGO_URI: mongoUri,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    SESSION_SECRET: sessionSecret,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN!
  };
};

// Export validated config
export const config = validateEnv();

// Log successful validation (only in development)
if (config.NODE_ENV === 'development') {
  console.log('✅ Environment variables validated successfully');
}
