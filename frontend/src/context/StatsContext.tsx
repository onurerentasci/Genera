'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketManager from '../services/socket.service';
import { useAuth } from './AuthContext';

interface StatsData {
  totalVisits: number;
  dailyVisits: number;
  uniqueVisitors: number;
  onlineUsers: number;
  lastVisitDate?: string;
}

interface OnlineUser {
  id: string;
  username: string;
  joinedAt: string;
}

interface StatsContextType {
  stats: StatsData;
  onlineUsers: OnlineUser[];
  onlineCount: number;
  isLoading: boolean;
  error: string | null;
  trackVisit: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalVisits: 0,
    dailyVisits: 0,
    uniqueVisitors: 0,
    onlineUsers: 0
  });
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ziyaret takibi
  const trackVisit = async () => {
    try {
      const response = await fetch('/api/stats/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Visit tracking error:', error);
    }
  };

  // İstatistikleri yenile
  const refreshStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/stats/public', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Stats refresh error:', error);
      setError('Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };
  // Socket.IO bağlantısını başlat
  useEffect(() => {
    const userData = isAuthenticated && user ? {
      userId: user.id,
      username: user.username
    } : undefined;

    // Socket bağlantısını başlat
    socketManager.connect(userData);

    // Online kullanıcıları dinle
    socketManager.onOnlineUsers((data) => {
      setOnlineUsers(data.users);
      setOnlineCount(data.count);
      
      // Stats'i güncelle
      setStats(prev => ({
        ...prev,
        onlineUsers: data.count
      }));
    });

    return () => {
      // Komponent unmount olduğunda bağlantıyı kapat
      socketManager.disconnect();
    };
  }, [isAuthenticated, user]);

  // İlk yükleme ve ziyaret takibi
  useEffect(() => {
    const initStats = async () => {
      await trackVisit();
      await refreshStats();
    };

    initStats();
  }, []);

  const value: StatsContextType = {
    stats,
    onlineUsers,
    onlineCount,
    isLoading,
    error,
    trackVisit,
    refreshStats
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
