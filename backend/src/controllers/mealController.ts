import { Request, Response, NextFunction } from 'express';
import { Meal } from '../models/Meal';
import { 
  CreateMealRequest, 
  UpdateMealRequest, 
  MealSearchQuery, 
  AuthenticatedRequest,
  MealCategory
} from '../types';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse, 
  getPaginationParams,
  getSortParams,
  ApiError,
  getPagination,
  getPaginatedResponse
} from '../utils/helpers';

/**
 * @swagger
 * components:
 *   schemas:
 *     Meal:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - prepTime
 *         - cookTime
 *         - servings
 *         - difficulty
 *         - ingredients
 *         - instructions
 *         - nutrition
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the meal
 *         name:
 *           type: string
 *           description: Name of the meal
 *         description:
 *           type: string
 *           description: Description of the meal
 *         category:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *           description: Meal category
 *         cuisine:
 *           type: string
 *           description: Type of cuisine
 *         prepTime:
 *           type: number
 *           description: Preparation time in minutes
 *         cookTime:
 *           type: number
 *           description: Cooking time in minutes
 *         servings:
 *           type: number
 *           description: Number of servings
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Difficulty level
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MealIngredient'
 *         instructions:
 *           type: array
 *           items:
 *             type: string
 *         nutrition:
 *           $ref: '#/components/schemas/NutritionInfo'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         image:
 *           type: string
 *           description: URL to meal image
 *         isPublic:
 *           type: boolean
 *           description: Whether the meal is public
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the meal
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MealIngredient:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - unit
 *         - calories
 *         - protein
 *         - carbs
 *         - fat
 *       properties:
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         unit:
 *           type: string
 *         calories:
 *           type: number
 *         protein:
 *           type: number
 *         carbs:
 *           type: number
 *         fat:
 *           type: number
 *         fiber:
 *           type: number
 *         sugar:
 *           type: number
 *         sodium:
 *           type: number
 *
 *     NutritionInfo:
 *       type: object
 *       required:
 *         - calories
 *         - protein
 *         - carbs
 *         - fat
 *       properties:
 *         calories:
 *           type: number
 *         protein:
 *           type: number
 *         carbs:
 *           type: number
 *         fat:
 *           type: number
 *         fiber:
 *           type: number
 *         sugar:
 *           type: number
 *         sodium:
 *           type: number
 *         cholesterol:
 *           type: number
 *         saturatedFat:
 *           type: number
 *         transFat:
 *           type: number
 *         monounsaturatedFat:
 *           type: number
 *         polyunsaturatedFat:
 *           type: number
 *         potassium:
 *           type: number
 *         calcium:
 *           type: number
 *         iron:
 *           type: number
 *         vitaminA:
 *           type: number
 *         vitaminC:
 *           type: number
 *         vitaminD:
 *           type: number
 */

/**
 * @swagger
 * /api/meals:
 *   post:
 *     summary: Create a new meal
 *     tags: [Meals]
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
 *               - category
 *               - prepTime
 *               - cookTime
 *               - servings
 *               - difficulty
 *               - ingredients
 *               - instructions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *               cuisine:
 *                 type: string
 *               prepTime:
 *                 type: number
 *               cookTime:
 *                 type: number
 *               servings:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               ingredients:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/MealIngredient'
 *               instructions:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Meal created successfully
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
 *                   $ref: '#/components/schemas/Meal'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
export const createMeal = async (
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

    const mealData = {
      ...req.body,
      createdBy: userId,
      isPublic: req.body.isPublic || false
    };

    const meal = new Meal(mealData);
    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals:
 *   get:
 *     summary: Get meals with filtering and pagination
 *     tags: [Meals]
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
 *         description: Number of meals per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack, dessert, drink, appetizer, side_dish]
 *         description: Filter by meal category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine type
 *       - in: query
 *         name: prepTimeMax
 *         schema:
 *           type: integer
 *         description: Maximum preparation time
 *       - in: query
 *         name: cookTimeMax
 *         schema:
 *           type: integer
 *         description: Maximum cooking time
 *       - in: query
 *         name: caloriesMin
 *         schema:
 *           type: integer
 *         description: Minimum calories
 *       - in: query
 *         name: caloriesMax
 *         schema:
 *           type: integer
 *         description: Maximum calories
 *       - in: query
 *         name: proteinMin
 *         schema:
 *           type: integer
 *         description: Minimum protein content
 *       - in: query
 *         name: dietType
 *         schema:
 *           type: string
 *         description: Filter by diet compatibility
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, description, or tags
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private meals
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator (only for admins or own meals)
 *     responses:
 *       200:
 *         description: Meals retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meal'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export const getMeals = async (
  req: Request<{}, {}, {}, MealSearchQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      cuisine,
      prepTimeMax,
      cookTimeMax,
      caloriesMin,
      caloriesMax,
      proteinMin,
      dietType,
      search,
      isPublic,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = {};

    // Public meals by default, unless user is viewing their own meals
    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    } else {
      query.isPublic = true;
    }

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (createdBy) query.createdBy = createdBy;

    // Time filters
    if (prepTimeMax) query.prepTime = { $lte: prepTimeMax };
    if (cookTimeMax) query.cookTime = { $lte: cookTimeMax };

    // Nutrition filters
    if (caloriesMin !== undefined || caloriesMax !== undefined) {
      query['nutrition.calories'] = {};
      if (caloriesMin !== undefined) query['nutrition.calories'].$gte = caloriesMin;
      if (caloriesMax !== undefined) query['nutrition.calories'].$lte = caloriesMax;
    }

    if (proteinMin !== undefined) {
      query['nutrition.protein'] = { $gte: proteinMin };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { cuisine: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    // Sort
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [meals, total] = await Promise.all([
      Meal.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Meal.countDocuments(query)
    ]);

    // Filter by diet compatibility if specified
    let filteredMeals = meals;
    if (dietType) {
      filteredMeals = meals.filter((meal: any) => meal.isCompatibleWithDiet(dietType));
    }

    res.json(paginatedResponse(filteredMeals, page, limitNum, total));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/{id}:
 *   get:
 *     summary: Get meal by ID
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal retrieved successfully
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
 *                   $ref: '#/components/schemas/Meal'
 *       404:
 *         description: Meal not found
 */
export const getMealById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meal = await Meal.findById(id).populate('createdBy', 'firstName lastName');

    if (!meal) {
      res.status(404).json(errorResponse('Meal not found'));
      return;
    }

    // Check if meal is public or user has access
    const user = (req as AuthenticatedRequest).user;
    if (!meal.isPublic && (!user || meal.createdBy.toString() !== user.id)) {
      res.status(403).json(errorResponse('Access denied'));
      return;
    }

    res.json({
      success: true,
      message: 'Meal retrieved successfully',
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/{id}:
 *   put:
 *     summary: Update meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meal'
 *     responses:
 *       200:
 *         description: Meal updated successfully
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
 *                   $ref: '#/components/schemas/Meal'
 *       404:
 *         description: Meal not found
 *       403:
 *         description: Access denied
 */
export const updateMeal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(errorResponse('User not authenticated')); return;
    }

    const meal = await Meal.findById(id);

    if (!meal) {
      res.status(404).json(errorResponse('Meal not found')); return;
    }

    // Check ownership or admin access
    if (meal.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json(errorResponse('Access denied')); return;
    }

    // Update meal
    Object.assign(meal, req.body);
    await meal.save();

    res.json({
      success: true,
      message: 'Meal updated successfully',
      data: meal
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     summary: Delete meal
 *     tags: [Meals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       404:
 *         description: Meal not found
 *       403:
 *         description: Access denied
 */
export const deleteMeal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(errorResponse('User not authenticated')); return;
    }

    const meal = await Meal.findById(id);

    if (!meal) {
      res.status(404).json(errorResponse('Meal not found')); return;
    }

    // Check ownership or admin access
    if (meal.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json(errorResponse('Access denied')); return;
    }

    await meal.deleteOne();

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/my:
 *   get:
 *     summary: Get current user's meals
 *     tags: [Meals]
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
 *         description: Number of meals per page
 *     responses:
 *       200:
 *         description: User meals retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Meal'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
export const getMyMeals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json(errorResponse('User not authenticated')); return;
    }

    const { page = 1, limit = 10 } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const [meals, total] = await Promise.all([
      Meal.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Meal.countDocuments({ createdBy: userId })
    ]);

    res.json(paginatedResponse(meals, pageNum, limitNum, total));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/categories:
 *   get:
 *     summary: Get available meal categories
 *     tags: [Meals]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: string
 */
export const getMealCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = Object.values(MealCategory);

    res.json({
      success: true,
      message: 'Meal categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/meals/{id}/nutrition-per-serving:
 *   get:
 *     summary: Get nutrition information per serving
 *     tags: [Meals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Nutrition per serving retrieved successfully
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
 *                   $ref: '#/components/schemas/NutritionInfo'
 */
export const getNutritionPerServing = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const meal = await Meal.findById(id);

    if (!meal) {
      res.status(404).json(errorResponse('Meal not found')); return;
    }

    const nutritionPerServing = (meal as any).calculateNutritionPerServing();

    res.json({
      success: true,
      message: 'Nutrition per serving retrieved successfully',
      data: nutritionPerServing
    });
  } catch (error) {
    next(error);
  }
};
