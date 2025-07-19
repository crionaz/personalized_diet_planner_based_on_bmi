import { Request, Response, NextFunction } from 'express';
import { DietPlan } from '../models/DietPlan';
import { Meal } from '../models/Meal';
import User from '../models/User';
import { 
  CreateDietPlanRequest, 
  UpdateDietPlanRequest, 
  DietPlanSearchQuery, 
  AuthenticatedRequest,
  INutritionalTargets,
  IDietPlanMeal,
  MealCategory
} from '../types';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  getPaginationParams,
  ApiError
} from '../utils/helpers';

/**
 * @swagger
 * components:
 *   schemas:
 *     DietPlan:
 *       type: object
 *       required:
 *         - name
 *         - startDate
 *         - endDate
 *         - nutritionalTargets
 *         - meals
 *         - generatedBy
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the diet plan
 *         userId:
 *           type: string
 *           description: ID of the user who owns the plan
 *         name:
 *           type: string
 *           description: Name of the diet plan
 *         description:
 *           type: string
 *           description: Description of the diet plan
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of the plan
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of the plan
 *         isActive:
 *           type: boolean
 *           description: Whether the plan is currently active
 *         nutritionalTargets:
 *           $ref: '#/components/schemas/NutritionalTargets'
 *         meals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DietPlanMeal'
 *         generatedBy:
 *           type: string
 *           enum: [user, ai, nutritionist]
 *           description: How the plan was generated
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NutritionalTargets:
 *       type: object
 *       required:
 *         - dailyCalories
 *         - dailyProtein
 *         - dailyCarbs
 *         - dailyFat
 *         - proteinPercentage
 *         - carbsPercentage
 *         - fatPercentage
 *       properties:
 *         dailyCalories:
 *           type: number
 *           description: Target daily calories
 *         dailyProtein:
 *           type: number
 *           description: Target daily protein in grams
 *         dailyCarbs:
 *           type: number
 *           description: Target daily carbs in grams
 *         dailyFat:
 *           type: number
 *           description: Target daily fat in grams
 *         dailyFiber:
 *           type: number
 *           description: Target daily fiber in grams
 *         dailySodium:
 *           type: number
 *           description: Target daily sodium in mg
 *         proteinPercentage:
 *           type: number
 *           description: Protein percentage of total calories
 *         carbsPercentage:
 *           type: number
 *           description: Carbs percentage of total calories
 *         fatPercentage:
 *           type: number
 *           description: Fat percentage of total calories
 *
 *     DietPlanMeal:
 *       type: object
 *       required:
 *         - mealId
 *         - dayOfWeek
 *         - mealType
 *         - servings
 *       properties:
 *         id:
 *           type: string
 *         mealId:
 *           type: string
 *           description: Reference to the meal
 *         meal:
 *           $ref: '#/components/schemas/Meal'
 *         dayOfWeek:
 *           type: number
 *           minimum: 0
 *           maximum: 6
 *           description: Day of week (0=Sunday, 6=Saturday)
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *         servings:
 *           type: number
 *           minimum: 0.25
 *           maximum: 10
 *         plannedDate:
 *           type: string
 *           format: date
 *         isCompleted:
 *           type: boolean
 *         completedAt:
 *           type: string
 *           format: date-time
 *         notes:
 *           type: string
 */

/**
 * Calculate nutritional targets based on user data
 */
const calculateNutritionalTargets = (user: any): INutritionalTargets => {
  const { healthMetrics, goals, dietaryPreferences } = user;
  
  // Base metabolic rate calculation (Mifflin-St Jeor equation)
  let bmr = 0;
  if (healthMetrics.weight && healthMetrics.height && user.profile.gender) {
    if (user.profile.gender === 'male') {
      bmr = 88.362 + (13.397 * healthMetrics.weight) + (4.799 * healthMetrics.height) - (5.677 * 25); // Assuming 25 years old
    } else {
      bmr = 447.593 + (9.247 * healthMetrics.weight) + (3.098 * healthMetrics.height) - (4.330 * 25);
    }
  }

  // Activity level multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };

  const activityMultiplier = activityMultipliers[healthMetrics.activityLevel as keyof typeof activityMultipliers] || 1.2;
  let dailyCalories = Math.round(bmr * activityMultiplier);

  // Adjust based on goals
  if (goals.type === 'weight_loss') {
    dailyCalories -= 500; // 500 calorie deficit for ~1 lb/week loss
  } else if (goals.type === 'weight_gain') {
    dailyCalories += 500; // 500 calorie surplus for weight gain
  } else if (goals.type === 'muscle_gain') {
    dailyCalories += 300; // Moderate surplus for muscle gain
  }

  // Ensure minimum calories
  dailyCalories = Math.max(dailyCalories, 1200);

  // Macronutrient distribution based on diet type
  let proteinPercentage = 20;
  let carbsPercentage = 50;
  let fatPercentage = 30;

  switch (dietaryPreferences.dietType) {
    case 'keto':
      proteinPercentage = 20;
      carbsPercentage = 10;
      fatPercentage = 70;
      break;
    case 'paleo':
      proteinPercentage = 25;
      carbsPercentage = 35;
      fatPercentage = 40;
      break;
    case 'mediterranean':
      proteinPercentage = 18;
      carbsPercentage = 45;
      fatPercentage = 37;
      break;
    case 'vegan':
    case 'vegetarian':
      proteinPercentage = 15;
      carbsPercentage = 60;
      fatPercentage = 25;
      break;
  }

  // Calculate macronutrients in grams
  const dailyProtein = Math.round((dailyCalories * proteinPercentage / 100) / 4); // 4 cal per gram
  const dailyCarbs = Math.round((dailyCalories * carbsPercentage / 100) / 4); // 4 cal per gram
  const dailyFat = Math.round((dailyCalories * fatPercentage / 100) / 9); // 9 cal per gram

  return {
    dailyCalories,
    dailyProtein,
    dailyCarbs,
    dailyFat,
    dailyFiber: Math.round(dailyCalories / 1000 * 14), // 14g per 1000 calories
    dailySodium: 2300, // WHO recommendation
    proteinPercentage,
    carbsPercentage,
    fatPercentage
  };
};

/**
 * Generate AI-powered meal plan
 */
const generateAIMealPlan = async (
  userId: string, 
  nutritionalTargets: INutritionalTargets,
  preferences: CreateDietPlanRequest['preferences']
): Promise<IDietPlanMeal[]> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const meals: IDietPlanMeal[] = [];
  const mealTypes: MealCategory[] = [];

  // Determine meal types based on preferences
  if (preferences?.includeBreakfast) mealTypes.push(MealCategory.BREAKFAST);
  if (preferences?.includeLunch) mealTypes.push(MealCategory.LUNCH);
  if (preferences?.includeDinner) mealTypes.push(MealCategory.DINNER);
  if (preferences?.includeSnacks) mealTypes.push(MealCategory.SNACK);

  if (mealTypes.length === 0) {
    mealTypes.push(MealCategory.BREAKFAST, MealCategory.LUNCH, MealCategory.DINNER);
  }

  // Calculate calories per meal type
  const caloriesPerMeal = Math.round(nutritionalTargets.dailyCalories / mealTypes.length);

  // Generate meals for each day of the week
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    for (const mealType of mealTypes) {
      // Build meal query based on preferences
      const mealQuery: any = {
        category: mealType,
        isPublic: true,
        'nutrition.calories': {
          $gte: caloriesPerMeal * 0.7,
          $lte: caloriesPerMeal * 1.3
        }
      };

      // Add diet compatibility filter
      if (user.dietaryPreferences.dietType !== 'regular') {
        mealQuery.tags = { $in: [user.dietaryPreferences.dietType] };
      }

      // Add time constraints
      if (preferences?.maxPrepTime) {
        mealQuery.prepTime = { $lte: preferences.maxPrepTime };
      }
      if (preferences?.maxCookTime) {
        mealQuery.cookTime = { $lte: preferences.maxCookTime };
      }

      // Add difficulty filter
      if (preferences?.difficulty) {
        mealQuery.difficulty = preferences.difficulty;
      }

      // Find suitable meals
      const suitableMeals = await Meal.find(mealQuery).limit(10);

      if (suitableMeals.length > 0) {
        // Select a random meal
        const selectedMeal = suitableMeals[Math.floor(Math.random() * suitableMeals.length)];
        
        if (!selectedMeal) {
          continue; // Skip if no suitable meal found
        }
        
        // Calculate serving size to match target calories
        const targetCalories = caloriesPerMeal;
        const mealCalories = selectedMeal.nutrition.calories;
        const servings = Math.round((targetCalories / mealCalories) * 10) / 10; // Round to 1 decimal

        meals.push({
          mealId: selectedMeal._id,
          dayOfWeek,
          mealType,
          servings: Math.max(0.25, Math.min(servings, 3)), // Clamp between 0.25 and 3 servings
          isCompleted: false
        });
      }
    }
  }

  return meals;
};

/**
 * @swagger
 * /api/diet-plans:
 *   post:
 *     summary: Create a new diet plan
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - generationType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               nutritionalTargets:
 *                 $ref: '#/components/schemas/NutritionalTargets'
 *               preferences:
 *                 type: object
 *                 properties:
 *                   includeBreakfast:
 *                     type: boolean
 *                   includeLunch:
 *                     type: boolean
 *                   includeDinner:
 *                     type: boolean
 *                   includeSnacks:
 *                     type: boolean
 *                   maxPrepTime:
 *                     type: number
 *                   maxCookTime:
 *                     type: number
 *                   difficulty:
 *                     type: string
 *                     enum: [easy, medium, hard]
 *               generationType:
 *                 type: string
 *                 enum: [ai, manual]
 *     responses:
 *       201:
 *         description: Diet plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/DietPlan'
 */
export const createDietPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(errorResponse('User not authenticated'));
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json(errorResponse('User not found'));
      return;
    }

    // Calculate nutritional targets if not provided
    let nutritionalTargets = req.body.nutritionalTargets;
    if (!nutritionalTargets || Object.keys(nutritionalTargets).length === 0) {
      nutritionalTargets = calculateNutritionalTargets(user);
    } else {
      // Fill in missing values with calculated ones
      const calculatedTargets = calculateNutritionalTargets(user);
      nutritionalTargets = { ...calculatedTargets, ...nutritionalTargets };
    }

    let meals: IDietPlanMeal[] = [];

    // Generate meals based on generation type
    if (req.body.generationType === 'ai') {
      meals = await generateAIMealPlan(userId, nutritionalTargets as INutritionalTargets, req.body.preferences);
    }

    // Deactivate other active plans
    await DietPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    const dietPlanData = {
      userId,
      name: req.body.name,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      isActive: true,
      nutritionalTargets: nutritionalTargets as INutritionalTargets,
      meals,
      generatedBy: req.body.generationType === 'ai' ? 'ai' : 'user',
      tags: []
    };

    const dietPlan = new DietPlan(dietPlanData);
    await dietPlan.save();

    // Populate meals
    await dietPlan.populate('meals.mealId');

    res.status(201).json({
      success: true,
      message: 'Diet plan created successfully',
      data: dietPlan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans:
 *   get:
 *     summary: Get user's diet plans
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of plans per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Diet plans retrieved successfully
 */
export const getDietPlans = async (
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
      limit = 10,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = { userId };
    if (isActive !== undefined) query.isActive = isActive;

    // Pagination
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    // Sort
    const sortOptions: any = {};
    const sortByField = Array.isArray(sortBy) ? sortBy[0] : sortBy;
    if (typeof sortByField === 'string') {
      sortOptions[sortByField] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const [dietPlans, total] = await Promise.all([
      DietPlan.find(query)
        .populate('meals.mealId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      DietPlan.countDocuments(query)
    ]);

    const response = paginatedResponse(dietPlans, pageNum, limitNum, total);

    res.json({
      success: true,
      message: 'Diet plans retrieved successfully',
      ...paginatedResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans/active:
 *   get:
 *     summary: Get user's active diet plan
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active diet plan retrieved successfully
 */
export const getActiveDietPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    const activePlan = await DietPlan.findActiveByUser(userId);

    res.json({
      success: true,
      message: 'Active diet plan retrieved successfully',
      data: activePlan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans/{id}:
 *   get:
 *     summary: Get diet plan by ID
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diet plan ID
 *     responses:
 *       200:
 *         description: Diet plan retrieved successfully
 */
export const getDietPlanById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const dietPlan = await DietPlan.findById(id).populate('meals.mealId');

    if (!dietPlan) {
      throw new ApiError('Diet plan not found', 404);
    }

    // Check ownership
    if (dietPlan.userId.toString() !== userId) {
      throw new ApiError('Access denied', 403);
    }

    res.json({
      success: true,
      message: 'Diet plan retrieved successfully',
      data: dietPlan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans/{id}/meals/{mealId}/complete:
 *   patch:
 *     summary: Mark meal as completed/uncompleted
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diet plan ID
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID within the plan
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Meal completion status updated
 */
export const markMealCompleted = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, mealId } = req.params;
    const { completed = true } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!mealId) {
      throw new ApiError('Meal ID is required', 400);
    }

    const dietPlan = await DietPlan.findById(id);

    if (!dietPlan) {
      throw new ApiError('Diet plan not found', 404);
    }

    // Check ownership
    if (dietPlan.userId.toString() !== userId) {
      throw new ApiError('Access denied', 403);
    }

    await dietPlan.markMealCompleted(mealId, completed);

    res.json({
      success: true,
      message: `Meal marked as ${completed ? 'completed' : 'not completed'}`,
      data: dietPlan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans/{id}/nutrition/{dayOfWeek}:
 *   get:
 *     summary: Get nutrition for specific day
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diet plan ID
 *       - in: path
 *         name: dayOfWeek
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: Day of week (0=Sunday, 6=Saturday)
 *     responses:
 *       200:
 *         description: Daily nutrition retrieved successfully
 */
export const getDailyNutrition = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, dayOfWeek } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError('User not authenticated', 401);
    }

    if (!dayOfWeek) {
      throw new ApiError('Day of week is required', 400);
    }

    const dietPlan = await DietPlan.findById(id).populate('meals.mealId');

    if (!dietPlan) {
      throw new ApiError('Diet plan not found', 404);
    }

    // Check ownership
    if (dietPlan.userId.toString() !== userId) {
      throw new ApiError('Access denied', 403);
    }

    const dayNum = parseInt(dayOfWeek);
    if (dayNum < 0 || dayNum > 6) {
      throw new ApiError('Invalid day of week', 400);
    }

    const dailyNutrition = dietPlan.calculateDailyNutrition(dayNum);

    res.json({
      success: true,
      message: 'Daily nutrition retrieved successfully',
      data: {
        dayOfWeek: dayNum,
        nutrition: dailyNutrition,
        targets: dietPlan.nutritionalTargets
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/diet-plans/{id}:
 *   delete:
 *     summary: Delete diet plan
 *     tags: [Diet Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diet plan ID
 *     responses:
 *       200:
 *         description: Diet plan deleted successfully
 */
export const deleteDietPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const dietPlan = await DietPlan.findById(id);

    if (!dietPlan) {
      throw new ApiError('Diet plan not found', 404);
    }

    // Check ownership
    if (dietPlan.userId.toString() !== userId) {
      throw new ApiError('Access denied', 403);
    }

    await dietPlan.deleteOne();

    res.json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
