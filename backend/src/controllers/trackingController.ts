import { Request, Response, NextFunction } from 'express';
import { FoodEntry } from '../models/FoodEntry';
import { WaterIntake } from '../models/WaterIntake';
import { Meal } from '../models/Meal';
import User from '../models/User';
import { 
  CreateFoodEntryRequest, 
  UpdateFoodEntryRequest, 
  FoodEntrySearchQuery,
  CreateWaterIntakeRequest,
  AuthenticatedRequest
} from '../types';
import { 
  ApiError,
  successResponse, 
  errorResponse, 
  paginatedResponse,
  getPaginationParams
} from '../utils/helpers';

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodEntry:
 *       type: object
 *       required:
 *         - userId
 *         - mealType
 *         - servings
 *         - consumedAt
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         mealId:
 *           type: string
 *         meal:
 *           $ref: '#/components/schemas/Meal'
 *         customFood:
 *           $ref: '#/components/schemas/CustomFood'
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *         servings:
 *           type: number
 *         consumedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CustomFood:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         brand:
 *           type: string
 *         nutrition:
 *           $ref: '#/components/schemas/NutritionInfo'
 *         servingSize:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             unit:
 *               type: string
 *
 *     WaterIntake:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *         - recordedAt
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *           description: Amount in ml
 *         recordedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tracking/food:
 *   post:
 *     summary: Log a food entry
 *     tags: [Food Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealType
 *               - servings
 *             properties:
 *               mealId:
 *                 type: string
 *               customFood:
 *                 $ref: '#/components/schemas/CustomFood'
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *               servings:
 *                 type: number
 *               consumedAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Food entry created successfully
 */
export const createFoodEntry = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    // Validate meal exists if mealId provided
    if (req.body.mealId) {
      const meal = await Meal.findById(req.body.mealId);
      if (!meal) {
        throw new ApiError('Meal not found', 404);
      }
    }

    const foodEntryData = {
      userId,
      mealId: req.body.mealId,
      customFood: req.body.customFood,
      mealType: req.body.mealType,
      servings: req.body.servings,
      consumedAt: req.body.consumedAt ? new Date(req.body.consumedAt) : new Date(),
      notes: req.body.notes
    };

    const foodEntry = new FoodEntry(foodEntryData);
    await foodEntry.save();

    // Populate meal data
    await foodEntry.populate('mealId');

    res.status(201).json({
      success: true,
      message: 'Food entry created successfully',
      data: foodEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/food:
 *   get:
 *     summary: Get food entries
 *     tags: [Food Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Food entries retrieved successfully
 */
export const getFoodEntries = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const {
      page = 1,
      limit = 20,
      date,
      dateFrom,
      dateTo,
      mealType,
      sortBy = 'consumedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = { userId };

    // Date filtering
    if (date) {
      const dateString = Array.isArray(date) ? date[0] : date;
      if (typeof dateString === 'string') {
        const targetDate = new Date(dateString);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        query.consumedAt = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }
    } else if (dateFrom || dateTo) {
      query.consumedAt = {};
      if (dateFrom) {
        const fromString = Array.isArray(dateFrom) ? dateFrom[0] : dateFrom;
        if (typeof fromString === 'string') {
          query.consumedAt.$gte = new Date(fromString);
        }
      }
      if (dateTo) {
        const toString = Array.isArray(dateTo) ? dateTo[0] : dateTo;
        if (typeof toString === 'string') {
          query.consumedAt.$lte = new Date(toString);
        }
      }
    }

    if (mealType) query.mealType = mealType;

    // Pagination
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    // Sort
    const sortOptions: any = {};
    const sortByField = Array.isArray(sortBy) ? sortBy[0] : sortBy;
    if (typeof sortByField === 'string') {
      sortOptions[sortByField] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const [foodEntries, total] = await Promise.all([
      FoodEntry.find(query)
        .populate('mealId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      FoodEntry.countDocuments(query)
    ]);

    const response = paginatedResponse(foodEntries, pageNum, limitNum, total);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/food/{id}:
 *   delete:
 *     summary: Delete food entry
 *     tags: [Food Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food entry deleted successfully
 */
export const deleteFoodEntry = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const foodEntry = await FoodEntry.findById(id);
    if (!foodEntry) {
      throw new ApiError('Food entry not found', 404);
    }

    // Check ownership
    if (foodEntry.userId !== userId) {
      throw new ApiError('Access denied', 403);
    }

    await foodEntry.deleteOne();

    res.json({
      success: true,
      message: 'Food entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/nutrition/daily/{date}:
 *   get:
 *     summary: Get daily nutrition summary
 *     tags: [Food Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily nutrition summary retrieved successfully
 */
export const getDailyNutrition = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!date) {
      throw new ApiError('Date parameter is required', 400);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new ApiError('Invalid date format', 400);
    }

    const summary = await FoodEntry.calculateDailyNutrition(userId, targetDate);

    // Get user's nutritional targets
    const user = await User.findById(userId);
    let targets = null;
    let targetProgress = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    const dailyCalories = user?.calculateDailyCalories();
    if (dailyCalories && dailyCalories > 0) {
      targets = {
        dailyCalories: dailyCalories,
        dailyProtein: Math.round(dailyCalories * 0.2 / 4), // 20% protein
        dailyCarbs: Math.round(dailyCalories * 0.5 / 4), // 50% carbs
        dailyFat: Math.round(dailyCalories * 0.3 / 9), // 30% fat
        dailyFiber: Math.round(dailyCalories / 1000 * 14),
        dailySodium: 2300,
        proteinPercentage: 20,
        carbsPercentage: 50,
        fatPercentage: 30
      };

      targetProgress = {
        calories: Math.round((summary.totalCalories / targets.dailyCalories) * 100),
        protein: Math.round((summary.totalProtein / targets.dailyProtein) * 100),
        carbs: Math.round((summary.totalCarbs / targets.dailyCarbs) * 100),
        fat: Math.round((summary.totalFat / targets.dailyFat) * 100)
      };
    }

    res.json({
      success: true,
      message: 'Daily nutrition summary retrieved successfully',
      data: {
        ...summary,
        targets,
        targetProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/stats:
 *   get:
 *     summary: Get tracking statistics
 *     tags: [Food Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tracking statistics retrieved successfully
 */
export const getTrackingStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const stats = await FoodEntry.getTrackingStats(userId);

    res.json({
      success: true,
      message: 'Tracking statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/water:
 *   post:
 *     summary: Log water intake
 *     tags: [Water Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount in ml
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Water intake logged successfully
 */
export const createWaterIntake = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const waterIntakeData = {
      userId,
      amount: req.body.amount,
      recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date(),
      notes: req.body.notes
    };

    const waterIntake = new WaterIntake(waterIntakeData);
    await waterIntake.save();

    res.status(201).json({
      success: true,
      message: 'Water intake logged successfully',
      data: waterIntake
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tracking/water/daily/{date}:
 *   get:
 *     summary: Get daily water intake
 *     tags: [Water Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily water intake retrieved successfully
 */
export const getDailyWaterIntake = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!date) {
      throw new ApiError('Date parameter is required', 400);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new ApiError('Invalid date format', 400);
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const entries = await WaterIntake.find({
      userId,
      recordedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ recordedAt: -1 });

    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const targetAmount = 2000; // 2L default target
    const progress = Math.round((totalAmount / targetAmount) * 100);

    res.json({
      success: true,
      message: 'Daily water intake retrieved successfully',
      data: {
        date: date,
        totalAmount,
        targetAmount,
        progress: Math.min(progress, 100),
        entries
      }
    });
  } catch (error) {
    next(error);
  }
};
