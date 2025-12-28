import express from 'express';
import { register, login, logout, me, linkMemberAccount } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes - accessible to all authenticated users
router.get('/me', protect, me);
router.post('/link-member', protect, linkMemberAccount);

// Example: Role-specific protected routes (to be implemented)
// router.get('/admin/users', protect, authorizeAdmin, getAllUsers);
// router.post('/organizer/events', protect, authorizeOrganizerOrAdmin, createEvent);
// router.put('/staff/checkin', protect, authorizeStaffOrOrganizer, performCheckin);

export default router;
