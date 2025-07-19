import { Router } from 'express';
import {
  createFoodEntry,
  getFoodEntries,
  deleteFoodEntry,
  getDailyNutrition,
  getTrackingStats,
  createWaterIntake,
  getDailyWaterIntake
} from '../controllers/trackingController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';
import { body, param, query } from 'express-validator';

const router = Router();

// Validation schemas
const createFoodEntryValidation = [
  body('mealType')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side_dish'])
    .withMessage('Invalid meal type'),
  
  body('servings')
    .isFloat({ min: 0.1, max: 20 })
    .withMessage('Servings must be between 0.1 and 20'),
  
  body('mealId')
    .optional()
    .isMongoId()
    .withMessage('Invalid meal ID'),
  
  body('customFood.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Custom food name must be between 1-100 characters'),
  
  body('customFood.nutrition.calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  
  body('customFood.nutrition.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  
  body('customFood.nutrition.carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a positive number'),
  
  body('customFood.nutrition.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a positive number'),
  
  body('consumedAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid consumed date format'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be max 500 characters'),
  
  // Custom validation: either mealId or customFood must be provided
  body().custom((value) => {
    if (!value.mealId && !value.customFood) {
      throw new Error('Either mealId or customFood must be provided');
    }
    if (value.mealId && value.customFood) {
      throw new Error('Cannot provide both mealId and customFood');
    }
    return true;
  }),
];

const getFoodEntriesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100'),
  
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateFrom format'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateTo format'),
  
  query('mealType')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side_dish'])
    .withMessage('Invalid meal type'),
  
  query('sortBy')
    .optional()
    .isIn(['consumedAt', 'createdAt', 'mealType'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];

const dateValidation = [
  param('date')
    .isISO8601()
    .withMessage('Invalid date format'),
];

const createWaterIntakeValidation = [
  body('amount')
    .isFloat({ min: 1, max: 5000 })
    .withMessage('Amount must be between 1-5000 ml'),
  
  body('recordedAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid recorded date format'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must be max 200 characters'),
];

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Food Tracking
 *   description: Food intake tracking and nutrition monitoring
 */

/**
 * @swagger
 * tags:
 *   name: Water Tracking
 *   description: Water intake tracking and hydration monitoring
 */

// Food tracking routes
router.post(
  '/food',
  createFoodEntryValidation,
  handleValidationErrors,
  createFoodEntry
);

router.get(
  '/food',
  getFoodEntriesValidation,
  handleValidationErrors,
  getFoodEntries
);

router.delete(
  '/food/:id',
  idValidation,
  handleValidationErrors,
  deleteFoodEntry
);

// Nutrition analysis routes
router.get(
  '/nutrition/daily/:date',
  dateValidation,
  handleValidationErrors,
  getDailyNutrition
);

router.get(
  '/stats',
  getTrackingStats
);

// Water tracking routes
router.post(
  '/water',
  createWaterIntakeValidation,
  handleValidationErrors,
  createWaterIntake
);

router.get(
  '/water/daily/:date',
  dateValidation,
  handleValidationErrors,
  getDailyWaterIntake
);

export default router;
