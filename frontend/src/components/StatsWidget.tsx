'use client';

import React from 'react';
import { useStats } from '../context/StatsContext';
import './StatsWidget.css';

interface StatsWidgetProps {
  showDetailed?: boolean;
  className?: string;
}

export default function StatsWidget({ showDetailed = false, className = '' }: StatsWidgetProps) {
  const { stats, onlineUsers, onlineCount, isLoading, error } = useStats();

  if (error) {
    return (
      <div className={`stats-widget error ${className}`}>
        <div className="stats-error">
          <span className="stats-error-icon">⚠️</span>
          <span>İstatistikler yüklenemedi</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`stats-widget loading ${className}`}>
        <div className="stats-loading">
          <div className="stats-spinner"></div>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-widget ${className}`}>
      <div className="stats-header">
        <h3 className="stats-title">
          📊 Analytics
        </h3>
      </div>

      <div className="stats-grid">
        <div className="stat-item online">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{onlineCount}</div>
            <div className="stat-label">Online</div>
          </div>
        </div>

        <div className="stat-item total-visits">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalVisits.toLocaleString()}</div>
            <div className="stat-label">Total Visitor</div>
          </div>
        </div>

        {showDetailed && (
          <>
            <div className="stat-item daily-visits">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-number">{stats.dailyVisits.toLocaleString()}</div>
                <div className="stat-label">Today</div>
              </div>
            </div>

            <div className="stat-item unique-visitors">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-number">{stats.uniqueVisitors.toLocaleString()}</div>
                <div className="stat-label">Unique Visitors</div>
              </div>
            </div>
          </>
        )}
      </div>

      {showDetailed && onlineUsers.length > 0 && (
        <div className="online-users-section">
          <h4 className="online-users-title">Online Users</h4>
          <div className="online-users-list">
            {onlineUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="online-user">
                <div className="online-user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="online-user-info">
                  <span className="online-user-name">{user.username}</span>
                  <span className="online-user-time">
                    {new Date(user.joinedAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            {onlineUsers.length > 5 && (
              <div className="more-users">
                +{onlineUsers.length - 5} daha
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
