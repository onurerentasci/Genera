import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';

/**
 * Default fetcher for SWR
 */
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  
  return response.json();
};

/**
 * Default SWR configuration
 */
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
};

/**
 * Hook for fetching public stats
 */
export function useStats() {
  return useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stats/public`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
}

/**
 * Hook for fetching online users count
 */
export function useOnlineUsers() {
  return useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stats/online`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 10000, // Refresh every 10 seconds
    }
  );
}

/**
 * Hook for fetching art timeline
 */
export function useArts(page = 1, limit = 20) {
  return useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/art/timeline?page=${page}&limit=${limit}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 60000, // Refresh every 60 seconds
    }
  );
}

/**
 * Hook for fetching single art by slug
 */
export function useArt(slug: string | null) {
  return useSWR(
    slug ? `${process.env.NEXT_PUBLIC_API_URL}/api/art/${slug}` : null,
    fetcher,
    defaultConfig
  );
}

/**
 * Hook for fetching user profile
 */
export function useUser(username: string | null) {
  return useSWR(
    username ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${username}` : null,
    fetcher,
    defaultConfig
  );
}

/**
 * Hook for fetching user's gallery
 */
export function useUserGallery(username: string | null, page = 1) {
  return useSWR(
    username
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${username}/gallery?page=${page}`
      : null,
    fetcher,
    defaultConfig
  );
}

/**
 * Hook for fetching user's liked arts
 */
export function useUserLiked(username: string | null, page = 1) {
  return useSWR(
    username
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/user/${username}/liked?page=${page}`
      : null,
    fetcher,
    defaultConfig
  );
}

/**
 * Hook for fetching news
 */
export function useNews(page = 1) {
  return useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/news?page=${page}`,
    fetcher,
    {
      ...defaultConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );
}
