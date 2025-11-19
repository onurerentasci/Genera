import NodeCache from 'node-cache';
import { CACHE_TTL } from '../constants';

/**
 * Cache Service
 * Provides in-memory caching for frequently accessed data
 */

// Stats cache - 60 seconds TTL
export const statsCache = new NodeCache({ 
  stdTTL: CACHE_TTL.SHORT,
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false  // Don't clone objects for better performance
});

// User cache - 5 minutes TTL
export const userCache = new NodeCache({ 
  stdTTL: CACHE_TTL.MEDIUM,
  checkperiod: 600,
  useClones: false
});

// Art timeline cache - 1 minute TTL (fast-changing data)
export const timelineCache = new NodeCache({ 
  stdTTL: CACHE_TTL.SHORT,
  checkperiod: 120,
  useClones: false
});

/**
 * Clear all caches
 */
export const clearAllCaches = (): void => {
  statsCache.flushAll();
  userCache.flushAll();
  timelineCache.flushAll();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    stats: statsCache.getStats(),
    user: userCache.getStats(),
    timeline: timelineCache.getStats()
  };
};
