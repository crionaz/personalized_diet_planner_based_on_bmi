import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  deleteAccount,
  getUserStats,
  updateHealthMetrics,
  updateDietaryPreferences,
  updateGoals,
} from '@/controllers/userController';
import { 
  authenticate, 
  requireAdmin,
  requireOwnershipOrAdmin 
} from '@/middleware/auth';
import {
  validateUpdateProfile,
  validateObjectId,
  validatePagination,
  validateUpdateHealthMetrics,
  validateUpdateDietaryPreferences,
  validateUpdateGoals,
} from '@/middleware/validation';
import { handleValidationErrors } from '@/middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticate, requireAdmin, validatePagination, handleValidationErrors, getUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticate, requireAdmin, getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, requireOwnershipOrAdmin('id'), validateObjectId('id'), handleValidationErrors, getUserById);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.put('/profile', authenticate, validateUpdateProfile, handleValidationErrors, updateProfile);

/**
 * @swagger
 * /api/users/health-metrics:
 *   put:
 *     summary: Update user health metrics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               height:
 *                 type: number
 *                 description: Height in centimeters
 *               weight:
 *                 type: number
 *                 description: Weight in kilograms
 *               activityLevel:
 *                 type: string
 *                 enum: [sedentary, lightly_active, moderately_active, very_active, extremely_active]
 *               targetWeight:
 *                 type: number
 *                 description: Target weight in kilograms
 *               weeklyWeightLossGoal:
 *                 type: number
 *                 minimum: 0.25
 *                 maximum: 1.0
 *     responses:
 *       200:
 *         description: Health metrics updated successfully
 *       401:
 *         description: Authentication required
 */
router.put('/health-metrics', authenticate, validateUpdateHealthMetrics, handleValidationErrors, updateHealthMetrics);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update dietary preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dietType:
 *                 type: string
 *                 enum: [regular, vegetarian, vegan, keto, paleo, mediterranean]
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               excludedFoods:
 *                 type: array
 *                 items:
 *                   type: string
 *               mealFrequency:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 6
 *     responses:
 *       200:
 *         description: Dietary preferences updated successfully
 *       401:
 *         description: Authentication required
 */
router.put('/preferences', authenticate, validateUpdateDietaryPreferences, handleValidationErrors, updateDietaryPreferences);

/**
 * @swagger
 * /api/users/goals:
 *   put:
 *     summary: Update health goals
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [weight_loss, weight_gain, maintenance, muscle_gain]
 *               targetDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Health goals updated successfully
 *       401:
 *         description: Authentication required
 */
router.put('/goals', authenticate, validateUpdateGoals, handleValidationErrors, updateGoals);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.delete('/account', authenticate, deleteAccount);

export default router;
