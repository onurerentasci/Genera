import winston from 'winston';
import { config } from '../config/env.config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Custom format for development
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom format for production
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Determine which transports to use based on environment
const transports: winston.transport[] = [];

if (config.NODE_ENV === 'production') {
  // Production: Write to files
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
} else {
  // Development: Write to console
  transports.push(
    new winston.transports.Console({
      format: devFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: config.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

export default logger;
