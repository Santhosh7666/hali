import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
router.get('/activity-logs', protect, authorize('admin'), async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Delete activity log
// @route   DELETE /api/admin/activity-logs/:id
// @access  Private/Admin
router.delete('/activity-logs/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log not found' });
    }
    await log.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Clear all activity logs
// @route   DELETE /api/admin/activity-logs
// @access  Private/Admin
router.delete('/activity-logs', protect, authorize('admin'), async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
