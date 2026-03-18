import express from 'express';
import { getAnalytics, getOverview } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Summary cards only — admin only
router.get('/overview', protect, authorize('admin'), getOverview);

// Full chart data — admin only
router.get('/', protect, authorize('admin'), getAnalytics);

export default router;
