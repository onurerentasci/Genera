'use client';

import React, { useEffect, useState } from 'react';
import { useStats } from '../context/StatsContext';
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
  const { stats, onlineCount, isLoading } = useStats();
  const [isVisible, setIsVisible] = useState(false);

  // Component mount edildiğinde göster
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

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
