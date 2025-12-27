import express from 'express';
import {
  getAllUsers,
  activateUser,
  deactivateUser,
  updateUserRole,
  deleteUser,
  getPlatformStats
} from '../controllers/adminController.js';
import { protect, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply protect and authorizeAdmin middleware to all routes
router.use(protect);
router.use(authorizeAdmin);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:id/activate', activateUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Platform statistics
router.get('/stats', getPlatformStats);

export default router;
