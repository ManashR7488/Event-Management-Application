import express from 'express';
import {
  getStats,
  getTeams,
  getAttendanceLogs,
  getFoodLogs,
  exportAttendanceCSV,
  exportFoodCSV,
} from '../controllers/dashboardController.js';
import { protect, authorizeOrganizerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require organizer or admin role
router.get('/stats', protect, authorizeOrganizerOrAdmin, getStats);
router.get('/teams', protect, authorizeOrganizerOrAdmin, getTeams);
router.get('/attendance', protect, authorizeOrganizerOrAdmin, getAttendanceLogs);
router.get('/food', protect, authorizeOrganizerOrAdmin, getFoodLogs);
router.get('/export/attendance', protect, authorizeOrganizerOrAdmin, exportAttendanceCSV);
router.get('/export/food', protect, authorizeOrganizerOrAdmin, exportFoodCSV);

export default router;
