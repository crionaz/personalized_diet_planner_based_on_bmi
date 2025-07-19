import { Response } from 'express';
import BMIRecord from '@/models/BMIRecord';
import { 
  AuthenticatedRequest, 
  ApiResponse,
  PaginationQuery 
} from '@/types';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  getPaginationParams 
} from '@/utils/helpers';
import { asyncHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

// BMI DTOs
export interface CalculateBMIDto {
  weight: number;
  height: number;
}

export interface RecordBMIDto {
  weight: number;
  height: number;
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  date?: Date;
  bodyFat?: number;
  muscleMass?: number;
}

/**
 * Calculate BMI without saving
 */
export const calculateBMI = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { weight, height }: CalculateBMIDto = req.body;

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
  
  // Determine category
  let category: string;
  if (bmi < 18.5) category = 'underweight';
  else if (bmi >= 18.5 && bmi < 25) category = 'normal';
  else if (bmi >= 25 && bmi < 30) category = 'overweight';
  else category = 'obese';

  res.json(successResponse('BMI calculated successfully', {
    bmi,
    category,
    weight,
    height,
  }));
});

/**
 * Record BMI measurement
 */
export const recordBMI = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { weight, height, bmi, category, date, bodyFat, muscleMass }: RecordBMIDto = req.body;

  // Create BMI record
  const bmiRecord = new BMIRecord({
    userId,
    weight,
    height,
    bmi,
    category,
    date: date || new Date(),
    bodyFat,
    muscleMass,
  });

  await bmiRecord.save();

  logger.info(`BMI record created for user: ${req.user!.email}`);

  res.status(201).json(successResponse('BMI record saved successfully', {
    bmiRecord: {
      id: bmiRecord._id,
      date: bmiRecord.date,
      weight: bmiRecord.weight,
      height: bmiRecord.height,
      bmi: bmiRecord.bmi,
      category: bmiRecord.category,
      bodyFat: bmiRecord.bodyFat,
      muscleMass: bmiRecord.muscleMass,
      createdAt: bmiRecord.createdAt,
    },
  }));
});

/**
 * Get BMI history for user
 */
export const getBMIHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { page, limit, skip } = getPaginationParams(req.query);
  const { sortBy = 'date', sortOrder = 'desc' } = req.query;

  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // Get BMI records
  const [records, total] = await Promise.all([
    BMIRecord.find({ userId })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    BMIRecord.countDocuments({ userId })
  ]);

  res.json(paginatedResponse(records.map((record: any) => ({
    id: record._id,
    date: record.date,
    weight: record.weight,
    height: record.height,
    bmi: record.bmi,
    category: record.category,
    bodyFat: record.bodyFat,
    muscleMass: record.muscleMass,
    createdAt: record.createdAt,
  })), page, limit, total, 'BMI history retrieved successfully'));
});

/**
 * Get latest BMI record
 */
export const getLatestBMI = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const latestRecord = await BMIRecord.findOne({ userId })
    .sort({ date: -1 });

  if (!latestRecord) {
    res.status(404).json(errorResponse('No BMI records found'));
    return;
  }

  res.json(successResponse('Latest BMI record retrieved successfully', {
    bmiRecord: {
      id: latestRecord._id,
      date: latestRecord.date,
      weight: latestRecord.weight,
      height: latestRecord.height,
      bmi: latestRecord.bmi,
      category: latestRecord.category,
      bodyFat: latestRecord.bodyFat,
      muscleMass: latestRecord.muscleMass,
      createdAt: latestRecord.createdAt,
    },
  }));
});

/**
 * Delete BMI record
 */
export const deleteBMIRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  const record = await BMIRecord.findOne({ _id: id, userId });

  if (!record) {
    res.status(404).json(errorResponse('BMI record not found'));
    return;
  }

  await BMIRecord.findByIdAndDelete(id);

  logger.info(`BMI record deleted: ${id} by user: ${req.user!.email}`);

  res.json(successResponse('BMI record deleted successfully'));
});

/**
 * Get BMI statistics
 */
export const getBMIStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  // Get recent records (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecords = await BMIRecord.find({ 
    userId, 
    date: { $gte: thirtyDaysAgo } 
  }).sort({ date: 1 });

  // Calculate trends
  const totalRecords = await BMIRecord.countDocuments({ userId });
  
  let trend = 'stable';
  let weightChange = 0;
  let bmiChange = 0;

  if (recentRecords.length >= 2) {
    const first = recentRecords[0];
    const last = recentRecords[recentRecords.length - 1];
    
    if (first && last) {
      weightChange = Number((last.weight - first.weight).toFixed(2));
      bmiChange = Number((last.bmi - first.bmi).toFixed(2));
      
      if (weightChange > 0.5) trend = 'increasing';
      else if (weightChange < -0.5) trend = 'decreasing';
    }
  }

  // Get category distribution
  const categoryStats = await BMIRecord.aggregate([
    { $match: { userId } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.json(successResponse('BMI statistics retrieved successfully', {
    totalRecords,
    recentRecords: recentRecords.length,
    trend,
    weightChange,
    bmiChange,
    categoryDistribution: categoryStats.reduce((acc: any, stat: any) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    latestBMI: recentRecords.length > 0 ? recentRecords[recentRecords.length - 1]?.bmi ?? null : null,
    latestCategory: recentRecords.length > 0 ? recentRecords[recentRecords.length - 1]?.category ?? null : null,
  }));
});
