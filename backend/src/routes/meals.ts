import express from 'express';
import {
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getMyMeals,
  getMealCategories,
  getNutritionPerServing
} from '../controllers/mealController';
import { authenticate } from '../middleware/auth';
import { 
  validateCreateMeal, 
  validateUpdateMeal, 
  validateMealQuery,
  validateMealId 
} from '../middleware/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Meals
 *   description: Meal management endpoints
 */

// Get meal categories (public)
router.get('/categories', getMealCategories);

// Get public meals with filtering and search
router.get('/', validateMealQuery, handleValidationErrors, getMeals);

// Get specific meal by ID
router.get('/:id', validateMealId, handleValidationErrors, getMealById);

// Get nutrition per serving for a meal
router.get('/:id/nutrition-per-serving', validateMealId, handleValidationErrors, getNutritionPerServing);

// Protected routes (require authentication)
router.use(authenticate);

// Get current user's meals
router.get('/my', getMyMeals);

// Create new meal
router.post('/', validateCreateMeal, handleValidationErrors, createMeal);

// Update meal (owner or admin only)
router.put('/:id', validateUpdateMeal, handleValidationErrors, updateMeal);

// Delete meal (owner or admin only)
router.delete('/:id', validateMealId, handleValidationErrors, deleteMeal);

export default router;
