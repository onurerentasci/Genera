'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  bio?: string;
  profileImage?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (profileData: { bio?: string; profileImage?: string }) => Promise<boolean>;
  error: string | null;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in (on initial load)
  useEffect(() => {
    // For client-side only
    if (typeof window !== 'undefined') {
      // Check for token in localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        // Fetch current user with the token
        fetchCurrentUser(storedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Set up axios interceptor to include token in every request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Fetch current user data with token
  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to authenticate user');
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      const userData = response.data.user;
      const tokenData = response.data.token;
      
      setUser(userData);
      setToken(tokenData);
      
      // Token'ı localStorage'a kaydet
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      
      return true; // Return true for successful login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return false; // Return false for failed login
    } finally {
      setIsLoading(false);
    }
  };  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );
      
      const userData = response.data.user;
      const tokenData = response.data.token;
      
      setUser(userData);
      setToken(tokenData);
      
      // Token'ı localStorage'a kaydet
      if (tokenData) {
        localStorage.setItem('token', tokenData);
      }
      
      return true; // Return true for successful registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return false; // Return false for failed registration
    } finally {
      setIsLoading(false);
    }
  };
  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {}, { withCredentials: true });
      
      // Kullanıcı verilerini temizle
      setUser(null);
      setToken(null);
      
      // localStorage'dan token'ı temizle
      localStorage.removeItem('token');
      
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData: { bio?: string; profileImage?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(
        `/api/profile`,
        profileData,
        { withCredentials: true }
      );
      
      if (response.data.success && user) {
        // Update the user object with new profile data
        setUser({
          ...user,
          bio: profileData.bio || user.bio,
          profileImage: profileData.profileImage || user.profileImage
        });
      }
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
