import { Router } from 'express';
import {
  calculateBMI,
  recordBMI,
  getBMIHistory,
  getLatestBMI,
  deleteBMIRecord,
  getBMIStats,
} from '@/controllers/bmiController';
import { authenticate } from '@/middleware/auth';
import {
  validateCalculateBMI,
  validateRecordBMI,
  validateObjectId,
  validatePagination,
} from '@/middleware/validation';
import { handleValidationErrors } from '@/middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BMI
 *   description: BMI calculation and tracking endpoints
 */

/**
 * @swagger
 * /api/bmi/calculate:
 *   post:
 *     summary: Calculate BMI without saving
 *     tags: [BMI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight
 *               - height
 *             properties:
 *               weight:
 *                 type: number
 *                 minimum: 20
 *                 maximum: 500
 *                 description: Weight in kilograms
 *               height:
 *                 type: number
 *                 minimum: 100
 *                 maximum: 250
 *                 description: Height in centimeters
 *     responses:
 *       200:
 *         description: BMI calculated successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/calculate', validateCalculateBMI, handleValidationErrors, calculateBMI);

/**
 * @swagger
 * /api/bmi/record:
 *   post:
 *     summary: Save BMI record
 *     tags: [BMI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weight
 *               - height
 *             properties:
 *               weight:
 *                 type: number
 *                 minimum: 20
 *                 maximum: 500
 *                 description: Weight in kilograms
 *               height:
 *                 type: number
 *                 minimum: 100
 *                 maximum: 250
 *                 description: Height in centimeters
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Measurement date (default: current date)
 *               bodyFat:
 *                 type: number
 *                 minimum: 3
 *                 maximum: 50
 *                 description: Body fat percentage
 *               muscleMass:
 *                 type: number
 *                 minimum: 10
 *                 maximum: 200
 *                 description: Muscle mass in kilograms
 *     responses:
 *       201:
 *         description: BMI record saved successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
router.post('/record', authenticate, validateRecordBMI, handleValidationErrors, recordBMI);

/**
 * @swagger
 * /api/bmi/history:
 *   get:
 *     summary: Get user's BMI history
 *     tags: [BMI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, weight, bmi, createdAt]
 *           default: date
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: BMI history retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/history', authenticate, validatePagination, getBMIHistory);

/**
 * @swagger
 * /api/bmi/latest:
 *   get:
 *     summary: Get latest BMI record
 *     tags: [BMI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest BMI record retrieved successfully
 *       404:
 *         description: No BMI records found
 *       401:
 *         description: Authentication required
 */
router.get('/latest', authenticate, getLatestBMI);

/**
 * @swagger
 * /api/bmi/stats:
 *   get:
 *     summary: Get BMI statistics and trends
 *     tags: [BMI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: BMI statistics retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/stats', authenticate, getBMIStats);

/**
 * @swagger
 * /api/bmi/record/{id}:
 *   delete:
 *     summary: Delete BMI record
 *     tags: [BMI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: BMI record ID
 *     responses:
 *       200:
 *         description: BMI record deleted successfully
 *       404:
 *         description: BMI record not found
 *       401:
 *         description: Authentication required
 */
router.delete('/record/:id', authenticate, validateObjectId, deleteBMIRecord);

export default router;
