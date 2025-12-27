import express from 'express';
import { checkFoodEligibility, logFoodDistribution } from '../controllers/foodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/food/check-eligibility
// @desc    Check if a member is eligible for food
// @access  Private (authenticated users)
router.post('/check-eligibility', protect, checkFoodEligibility);

// @route   POST /api/food/scan
// @desc    Log food distribution for a member
// @access  Private (authenticated users)
router.post('/scan', protect, logFoodDistribution);

export default router;
