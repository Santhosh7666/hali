import express from 'express';
import {
  getOrders,
  createOrder,
  purchaseOrder,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Any authenticated user can place a store purchase
router.post('/purchase', protect, purchaseOrder);

// Authenticated users (admin sees all, user sees their own)
router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

export default router;
