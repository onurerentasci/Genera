'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface CsrfContextType {
  csrfToken: string | null;
  getCsrfToken: () => Promise<string>;
  refreshCsrfToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export const CsrfProvider = ({ children }: { children: ReactNode }) => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  // Fetch CSRF token from server
  const fetchCsrfToken = async (): Promise<string> => {
    try {
      const response = await axios.get('/api/csrf-token', {
        withCredentials: true
      });
      
      if (response.data.success && response.data.csrfToken) {
        const token = response.data.csrfToken;
        setCsrfToken(token);
        return token;
      }
      
      throw new Error('Failed to fetch CSRF token');
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  };

  // Get current CSRF token or fetch a new one
  const getCsrfToken = async (): Promise<string> => {
    if (csrfToken) {
      return csrfToken;
    }
    
    return await fetchCsrfToken();
  };

  // Refresh CSRF token
  const refreshCsrfToken = async (): Promise<void> => {
    await fetchCsrfToken();
  };

  // Initialize CSRF token on mount
  useEffect(() => {
    fetchCsrfToken().catch(console.error);
  }, []);

  // Setup axios interceptor to automatically add CSRF token to requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        // Only add CSRF token to state-changing methods
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
          try {
            const token = await getCsrfToken();
            config.headers['X-CSRF-Token'] = token;
          } catch (error) {
            console.error('Failed to get CSRF token for request:', error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Setup response interceptor to handle CSRF token errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If we get a CSRF error, try to refresh the token and retry once
        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF') &&
            !error.config._csrfRetried) {
          
          try {
            await refreshCsrfToken();
            const newToken = await getCsrfToken();
            
            // Mark this request as retried
            error.config._csrfRetried = true;
            error.config.headers['X-CSRF-Token'] = newToken;
            
            // Retry the request
            return axios.request(error.config);
          } catch (refreshError) {
            console.error('Failed to refresh CSRF token:', refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [csrfToken]);

  return (
    <CsrfContext.Provider value={{ 
      csrfToken, 
      getCsrfToken, 
      refreshCsrfToken 
    }}>
      {children}
    </CsrfContext.Provider>
  );
};

export const useCsrf = (): CsrfContextType => {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
};
