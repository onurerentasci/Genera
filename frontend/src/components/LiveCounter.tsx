'use client';

import React, { useEffect, useState } from 'react';
import { useStats, useOnlineUsers } from '../hooks/useSWR';
import './LiveCounter.css';

interface LiveCounterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showVisitors?: boolean;
  showOnline?: boolean;
  className?: string;
}

export default function LiveCounter({ 
  position = 'bottom-right',
  showVisitors = true,
  showOnline = true,
  className = ''
}: LiveCounterProps) {
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: onlineData, isLoading: onlineLoading } = useOnlineUsers();
  const [isVisible, setIsVisible] = useState(false);

  // Component mount edildiğinde göster
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = statsLoading || onlineLoading;
  const stats = statsData?.data || { totalVisits: 0 };
  const onlineCount = onlineData?.data?.onlineUsers || 0;

  if (isLoading || (!showVisitors && !showOnline)) {
    return null;
  }

  return (
    <div className={`live-counter ${position} ${isVisible ? 'visible' : ''} ${className}`}>
      <div className="live-counter-content">
        {showOnline && (
          <div className="counter-item online">
            <div className="counter-indicator">
              <div className="pulse-dot"></div>
            </div>
            <div className="counter-info">
              <span className="counter-number">{onlineCount}</span>
              <span className="counter-label">Online</span>
            </div>
          </div>
        )}
        
        {showVisitors && (
          <div className="counter-item visitors">
            <div className="counter-icon">👥</div>
            <div className="counter-info">
              <span className="counter-number">{stats.totalVisits.toLocaleString()}</span>
              <span className="counter-label">Ziyaretçi</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
