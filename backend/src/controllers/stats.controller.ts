import { Request, Response, NextFunction } from 'express';
import Stats from '../models/Stats';
import logger from '../utils/logger';
import { statsCache } from '../services/cache.service';
import { HTTP_STATUS } from '../constants';

// Extend Session interface
declare global {
  namespace Express {
    interface Session {
      visited?: boolean;
    }
  }
}

// Ziyaretçi sayacını artır
export const trackVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // İstatistikleri al veya oluştur
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats({
        totalVisits: 1,
        dailyVisits: 1,
        lastVisitDate: today,
        uniqueVisitors: 1,
        onlineUsers: 0
      });
    } else {
      // Toplam ziyaret sayısını artır
      stats.totalVisits += 1;
      
      // Eğer bugün ilk ziyaretse günlük sayacı sıfırla
      const lastVisit = new Date(stats.lastVisitDate);
      lastVisit.setHours(0, 0, 0, 0);
      
      if (lastVisit.getTime() !== today.getTime()) {
        stats.dailyVisits = 1;
        stats.lastVisitDate = today;
      } else {
        stats.dailyVisits += 1;
      }
        // Unique visitor kontrolü için IP bazlı basit kontrol
      // Gerçek projelerde daha sofistike yöntemler kullanılabilir
      const clientIP = req.ip || req.connection.remoteAddress;
      const session = req.session as any;
      if (clientIP && !session.visited) {
        stats.uniqueVisitors += 1;
        session.visited = true;
      }
    }
    
    await stats.save();
    
    res.status(200).json({
      success: true,
      data: {
        totalVisits: stats.totalVisits,
        dailyVisits: stats.dailyVisits,
        uniqueVisitors: stats.uniqueVisitors,
        onlineUsers: stats.onlineUsers
      }
    });
  } catch (error: any) {
    logger.error('Visit tracking error', { error: error.message });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Visit tracking failed',
      error: error.message
    });
  }
};

// İstatistikleri getir (with caching)
export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cacheKey = 'public_stats';
    const cached = statsCache.get(cacheKey);
    
    if (cached) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: cached,
        cached: true
      });
      return;
    }
    
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }
    
    const data = {
      totalVisits: stats.totalVisits,
      dailyVisits: stats.dailyVisits,
      uniqueVisitors: stats.uniqueVisitors,
      onlineUsers: stats.onlineUsers,
      lastVisitDate: stats.lastVisitDate
    };
    
    statsCache.set(cacheKey, data);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
      cached: false
    });
  } catch (error: any) {
    logger.error('Stats fetch error', { error: error.message });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// Online kullanıcı sayısını güncelle
export const updateOnlineUsers = async (count: number): Promise<void> => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats({ onlineUsers: count });
    } else {
      stats.onlineUsers = count;
    }
    
    await stats.save();
    
    // Invalidate cache when online users update
    statsCache.del('public_stats');
  } catch (error: any) {
    logger.error('Online users update error', { error: error.message });
  }
};

// Analitik verilerini getir (admin için, with caching)
export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cacheKey = 'analytics_data';
    const cached = statsCache.get(cacheKey);
    
    if (cached) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: cached,
        cached: true
      });
      return;
    }
    
    const stats = await Stats.findOne();
    
    if (!stats) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'No analytics data found'
      });
      return;
    }
    
    // Basit analitik verileri
    const analyticsData = {
      totalVisits: stats.totalVisits,
      dailyVisits: stats.dailyVisits,
      uniqueVisitors: stats.uniqueVisitors,
      onlineUsers: stats.onlineUsers,
      lastVisitDate: stats.lastVisitDate,
      averageVisitsPerDay: Math.round(stats.totalVisits / Math.max(1, Math.ceil((Date.now() - stats.createdAt.getTime()) / (1000 * 60 * 60 * 24)))),
      bounceRate: Math.random() * 30 + 20, // Mock data - gerçek hesaplama yapılabilir
      sessionDuration: Math.random() * 300 + 120 // Mock data - gerçek hesaplama yapılabilir
    };
    
    statsCache.set(cacheKey, analyticsData);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: analyticsData,
      cached: false
    });
  } catch (error: any) {
    logger.error('Analytics fetch error', { error: error.message });
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
