'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StatsWidget from '@/components/StatsWidget';
import './analytics.css';

interface AnalyticsData {
  totalVisits: number;
  dailyVisits: number;
  uniqueVisitors: number;
  onlineUsers: number;
  lastVisitDate: string;
  averageVisitsPerDay: number;
  bounceRate: number;
  sessionDuration: number;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Analitik verilerini getir
  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/stats/analytics', {
        method: 'GET',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch analytics');
        }
      } else if (response.status === 401) {
        setError('Unauthorized access. Admin rights required.');
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Yenile butonu
  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (error) {
    return (
      <AdminLayout
        title="Site Analytics"
        description="View detailed website statistics and user behavior analytics."
      >
        <div className="analytics-error">
          <div className="error-icon">⚠️</div>
          <h3>Analytics Unavailable</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Site Analytics"
      description="View detailed website statistics and user behavior analytics."
    >
      {/* Header Controls */}
      <div className="analytics-header">
        <div className="header-actions">
          <button 
            onClick={handleRefresh} 
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <span className="refresh-icon">🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Widget */}
      <div className="analytics-stats-section">
        <StatsWidget showDetailed={true} className="admin-analytics-widget" />
      </div>

      {/* Detailed Analytics */}
      {analytics && (
        <div className="analytics-grid">
          {/* Overview Cards */}
          <div className="analytics-card overview-card">
            <div className="card-header">
              <h3>📊 Overview</h3>
              <span className="card-subtitle">General site metrics</span>
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{analytics.totalVisits.toLocaleString()}</div>
                <div className="metric-label">Total Visits</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{analytics.dailyVisits.toLocaleString()}</div>
                <div className="metric-label">Today's Visits</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{analytics.uniqueVisitors.toLocaleString()}</div>
                <div className="metric-label">Unique Visitors</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{analytics.onlineUsers}</div>
                <div className="metric-label">Currently Online</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="analytics-card performance-card">
            <div className="card-header">
              <h3>📈 Performance</h3>
              <span className="card-subtitle">User engagement metrics</span>
            </div>
            <div className="performance-metrics">
              <div className="performance-item">
                <div className="performance-label">Average Daily Visits</div>
                <div className="performance-value">
                  {analytics.averageVisitsPerDay.toLocaleString()}
                  <span className="performance-unit">visits/day</span>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">Bounce Rate</div>
                <div className="performance-value">
                  {analytics.bounceRate.toFixed(1)}%
                  <span className="performance-indicator good">Good</span>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-label">Avg. Session Duration</div>
                <div className="performance-value">
                  {Math.floor(analytics.sessionDuration / 60)}m {Math.floor(analytics.sessionDuration % 60)}s
                  <span className="performance-indicator excellent">Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="analytics-card activity-card">
            <div className="card-header">
              <h3>🕒 Recent Activity</h3>
              <span className="card-subtitle">Latest site activity</span>
            </div>
            <div className="activity-content">
              <div className="activity-item">
                <div className="activity-icon">👥</div>
                <div className="activity-details">
                  <div className="activity-title">Last Visit</div>
                  <div className="activity-time">
                    {new Date(analytics.lastVisitDate).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🟢</div>
                <div className="activity-details">
                  <div className="activity-title">Real-time Users</div>
                  <div className="activity-description">
                    {analytics.onlineUsers} users currently browsing
                  </div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">📈</div>
                <div className="activity-details">
                  <div className="activity-title">Growth Trend</div>
                  <div className="activity-description">
                    {analytics.dailyVisits > analytics.averageVisitsPerDay ? 'Above' : 'Below'} average daily visits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      )}
    </AdminLayout>
  );
}
