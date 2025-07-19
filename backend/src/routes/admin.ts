import { Router } from 'express';
import {
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getDashboardStats,
  getSystemInfo,
  bulkUpdateUsers,
} from '@/controllers/adminController';
import { getUsers, getUserById } from '@/controllers/userController';
import { 
  authenticate, 
  requireAdmin,
  requireSuperAdmin 
} from '@/middleware/auth';
import {
  validateCreateUser,
  validateUpdateUserRole,
  validateObjectId,
  validatePagination,
} from '@/middleware/validation';
import { handleValidationErrors } from '@/middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/system:
 *   get:
 *     summary: Get system information (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System information retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super Admin access required
 */
router.get('/system', authenticate, requireSuperAdmin, getSystemInfo);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with admin view
 *     tags: [Admin]
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
router.get('/users', authenticate, requireAdmin, validatePagination, handleValidationErrors, getUsers);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *                 default: user
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists or validation error
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post('/users', authenticate, requireAdmin, validateCreateUser, handleValidationErrors, createUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (admin view)
 *     tags: [Admin]
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
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get('/users/:id', authenticate, requireAdmin, validateObjectId('id'), handleValidationErrors, getUserById);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role and permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, super_admin]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/users/:id/role', authenticate, requireAdmin, validateObjectId('id'), validateUpdateUserRole, handleValidationErrors, updateUserRole);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Admin]
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
 *         description: User status updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.patch('/users/:id/status', authenticate, requireAdmin, validateObjectId('id'), handleValidationErrors, toggleUserStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', authenticate, requireAdmin, validateObjectId('id'), handleValidationErrors, deleteUser);

/**
 * @swagger
 * /api/admin/users/bulk-update:
 *   patch:
 *     summary: Bulk update users (Super Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - updates
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *     responses:
 *       200:
 *         description: Users updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Super Admin access required
 */
router.patch('/users/bulk-update', authenticate, requireSuperAdmin, bulkUpdateUsers);

export default router;
