const express = require('express');
const { body, param } = require('express-validator');
const {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasksAdmin,
} = require('../controllers/task.controller');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../models/User');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  '/',
  [
    body('title').isString().isLength({ min: 1 }).trim(),
    body('description').optional().isString().trim(),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  ],
  createTask
);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks for current user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', getMyTasks);

router.get(
  '/:id',
  [param('id').isMongoId()],
  getTaskById
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().isString().isLength({ min: 1 }).trim(),
    body('description').optional().isString().trim(),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  ],
  updateTask
);

router.delete('/:id', [param('id').isMongoId()], deleteTask);

// Admin-only route
router.get('/admin/all', requireRole(USER_ROLES.ADMIN), getAllTasksAdmin);

module.exports = router;


