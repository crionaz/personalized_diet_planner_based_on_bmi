import { Router } from 'express';
import {
  createDietPlan,
  getDietPlans,
  getActiveDietPlan,
  getDietPlanById,
  markMealCompleted,
  getDailyNutrition,
  deleteDietPlan
} from '../controllers/dietPlanController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation schemas
const createDietPlanValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be max 500 characters'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('generationType')
    .isIn(['ai', 'manual'])
    .withMessage('Generation type must be either "ai" or "manual"'),
  
  // Nutritional targets validation (optional)
  body('nutritionalTargets.dailyCalories')
    .optional()
    .isFloat({ min: 800, max: 5000 })
    .withMessage('Daily calories must be between 800-5000'),
  
  body('nutritionalTargets.dailyProtein')
    .optional()
    .isFloat({ min: 10, max: 300 })
    .withMessage('Daily protein must be between 10-300g'),
  
  body('nutritionalTargets.dailyCarbs')
    .optional()
    .isFloat({ min: 20, max: 800 })
    .withMessage('Daily carbs must be between 20-800g'),
  
  body('nutritionalTargets.dailyFat')
    .optional()
    .isFloat({ min: 10, max: 200 })
    .withMessage('Daily fat must be between 10-200g'),
  
  body('nutritionalTargets.dailyFiber')
    .optional()
    .isFloat({ min: 10, max: 100 })
    .withMessage('Daily fiber must be between 10-100g'),
  
  body('nutritionalTargets.dailySodium')
    .optional()
    .isFloat({ min: 500, max: 5000 })
    .withMessage('Daily sodium must be between 500-5000mg'),
  
  body('nutritionalTargets.proteinPercentage')
    .optional()
    .isFloat({ min: 5, max: 50 })
    .withMessage('Protein percentage must be between 5-50%'),
  
  body('nutritionalTargets.carbsPercentage')
    .optional()
    .isFloat({ min: 5, max: 80 })
    .withMessage('Carbs percentage must be between 5-80%'),
  
  body('nutritionalTargets.fatPercentage')
    .optional()
    .isFloat({ min: 10, max: 80 })
    .withMessage('Fat percentage must be between 10-80%'),
  
  // Preferences validation (optional)
  body('preferences.includeBreakfast')
    .optional()
    .isBoolean()
    .withMessage('Include breakfast must be a boolean'),
  
  body('preferences.includeLunch')
    .optional()
    .isBoolean()
    .withMessage('Include lunch must be a boolean'),
  
  body('preferences.includeDinner')
    .optional()
    .isBoolean()
    .withMessage('Include dinner must be a boolean'),
  
  body('preferences.includeSnacks')
    .optional()
    .isBoolean()
    .withMessage('Include snacks must be a boolean'),
  
  body('preferences.maxPrepTime')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Max prep time must be between 1-300 minutes'),
  
  body('preferences.maxCookTime')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Max cook time must be between 1-300 minutes'),
  
  body('preferences.difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
];

const getDietPlansValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'startDate', 'endDate'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid diet plan ID'),
];

const mealCompletionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid diet plan ID'),
  
  param('mealId')
    .isMongoId()
    .withMessage('Invalid meal ID'),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
];

const dailyNutritionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid diet plan ID'),
  
  param('dayOfWeek')
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0-6'),
];

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Diet Plans
 *   description: Diet plan management and meal planning
 */

// Create diet plan
router.post(
  '/',
  createDietPlanValidation,
  validate,
  createDietPlan
);

// Get user's diet plans
router.get(
  '/',
  getDietPlansValidation,
  validate,
  getDietPlans
);

// Get active diet plan
router.get(
  '/active',
  getActiveDietPlan
);

// Get diet plan by ID
router.get(
  '/:id',
  idValidation,
  validate,
  getDietPlanById
);

// Mark meal as completed/uncompleted
router.patch(
  '/:id/meals/:mealId/complete',
  mealCompletionValidation,
  validate,
  markMealCompleted
);

// Get daily nutrition for specific day
router.get(
  '/:id/nutrition/:dayOfWeek',
  dailyNutritionValidation,
  validate,
  getDailyNutrition
);

// Delete diet plan
router.delete(
  '/:id',
  idValidation,
  validate,
  deleteDietPlan
);

export default router;
