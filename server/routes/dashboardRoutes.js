import express from 'express';
import { 
  getDashboards, 
  createDashboard, 
  updateDashboard, 
  deleteDashboard 
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin-only: only admins can create, view, update, delete dashboards
router.route('/')
  .get(protect, authorize('admin'), getDashboards)
  .post(protect, authorize('admin'), createDashboard);

router.route('/:id')
  .put(protect, authorize('admin'), updateDashboard)
  .delete(protect, authorize('admin'), deleteDashboard);

export default router;
