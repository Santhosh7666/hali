import express from 'express';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  purchaseProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All authenticated users can view products
router.get('/', protect, getAllProducts);

// Admin only: create product
router.post('/', protect, authorize('admin'), createProduct);

// Admin only: update / delete product
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Any authenticated user: purchase product
router.post('/:id/purchase', protect, purchaseProduct);

export default router;
