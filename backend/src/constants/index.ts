/**
 * HTTP Status Code Constants
 * Use these throughout the application for consistent response codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Time Duration Constants
 * All values in milliseconds
 */
export const TIME = {
  ONE_SECOND_MS: 1000,
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH_MS: 30 * 24 * 60 * 60 * 1000,
  ONE_YEAR_MS: 365 * 24 * 60 * 60 * 1000
} as const;

/**
 * JWT Configuration
 */
export const JWT = {
  EXPIRY: '7d',
  COOKIE_NAME: 'token'
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  VERY_LONG: 86400  // 24 hours
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  USER: 'user' as const,
  ADMIN: 'admin' as const
} as const;

/**
 * API Response Messages
 */
export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  BAD_REQUEST: 'Invalid request data',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed'
} as const;
