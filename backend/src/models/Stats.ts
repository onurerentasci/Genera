import mongoose, { Document, Schema } from 'mongoose';

// Ziyaretçi istatistikleri için interface
export interface IStats extends Document {
  totalVisits: number;
  dailyVisits: number;
  lastVisitDate: Date;
  uniqueVisitors: number;
  onlineUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

// Stats Schema
const StatsSchema: Schema = new Schema({
  totalVisits: {
    type: Number,
    default: 0
  },
  dailyVisits: {
    type: Number,
    default: 0
  },
  lastVisitDate: {
    type: Date,
    default: new Date()
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  onlineUsers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<IStats>('Stats', StatsSchema);
