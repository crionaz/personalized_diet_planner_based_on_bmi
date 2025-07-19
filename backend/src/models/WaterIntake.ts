import mongoose, { Schema, Model } from 'mongoose';
import { IWaterIntake } from '../types';

// Define interface for static methods
interface IWaterIntakeModel extends Model<IWaterIntake> {
  findByDate(userId: string, date: Date): Promise<IWaterIntake[]>;
  calculateDailyTotal(userId: string, date: Date): Promise<any>;
}

const WaterIntakeSchema = new Schema<IWaterIntake>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
    max: 5000 // Max 5 liters per entry
  },
  recordedAt: {
    type: Date,
    required: true,
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
WaterIntakeSchema.index({ userId: 1, recordedAt: -1 });

// Static methods
WaterIntakeSchema.statics.findByDate = function(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    userId,
    recordedAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  }).sort({ recordedAt: -1 });
};

WaterIntakeSchema.statics.calculateDailyTotal = async function(userId: string, date: Date) {
  const entries = await (this as IWaterIntakeModel).findByDate(userId, date);
  const total = entries.reduce((sum: number, entry: any) => sum + entry.amount, 0);
  
  return {
    date: date.toISOString().split('T')[0],
    totalAmount: total,
    entries: entries
  };
};

WaterIntakeSchema.statics.getWeeklyAverage = async function(userId: string, weekStartDate: Date) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  
  const entries = await this.find({
    userId,
    recordedAt: {
      $gte: weekStartDate,
      $lte: weekEndDate
    }
  });
  
  const dailyTotals: { [date: string]: number } = {};
  
  entries.forEach((entry: any) => {
    const dateKey = entry.recordedAt.toISOString().split('T')[0];
    dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + entry.amount;
  });
  
  const daysWithEntries = Object.keys(dailyTotals).length;
  const totalAmount = Object.values(dailyTotals).reduce((sum, amount) => sum + amount, 0);
  
  return daysWithEntries > 0 ? Math.round(totalAmount / daysWithEntries) : 0;
};

export const WaterIntake = mongoose.model<IWaterIntake, IWaterIntakeModel>('WaterIntake', WaterIntakeSchema);
