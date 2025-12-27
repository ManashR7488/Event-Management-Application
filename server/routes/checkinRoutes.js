import express from 'express';
import { scanMemberQR, getCheckInStatus } from '../controllers/checkinController.js';
import { protect, authorizeStaff } from '../middleware/auth.js';

const router = express.Router();

// Staff-only route for scanning QR codes
router.post('/scan', protect, authorizeStaff, scanMemberQR);

// All authenticated users can check status
router.get('/status/:qrToken', protect, getCheckInStatus);

export default router;
