import { Request, Response, NextFunction } from 'express';
import Stats from '../models/Stats';

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
    console.error('Visit tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Visit tracking failed',
      error: error.message
    });
  }
};

// İstatistikleri getir
export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let stats = await Stats.findOne();
    
    if (!stats) {
      stats = new Stats();
      await stats.save();
    }
    
    res.status(200).json({
      success: true,
      data: {
        totalVisits: stats.totalVisits,
        dailyVisits: stats.dailyVisits,
        uniqueVisitors: stats.uniqueVisitors,
        onlineUsers: stats.onlineUsers,
        lastVisitDate: stats.lastVisitDate
      }
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
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
  } catch (error: any) {
    console.error('Online users update error:', error);
  }
};

// Analitik verilerini getir (admin için)
export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Stats.findOne();
      if (!stats) {
      res.status(404).json({
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
    
    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error: any) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
