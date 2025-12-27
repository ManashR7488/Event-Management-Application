import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  getEventCanteenQR,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorizeOrganizerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes accessible to all authenticated users
router.get('/', protect, getAllEvents);
router.get('/:id', protect, getEventById);

// Protected routes for organizers and admins only
router.post('/', protect, authorizeOrganizerOrAdmin, createEvent);
router.patch('/:id', protect, authorizeOrganizerOrAdmin, updateEvent);
router.delete('/:id', protect, authorizeOrganizerOrAdmin, deleteEvent);
router.get('/:id/canteen-qr', protect, authorizeOrganizerOrAdmin, getEventCanteenQR);

export default router;
