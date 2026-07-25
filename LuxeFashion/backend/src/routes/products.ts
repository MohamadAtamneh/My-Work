import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController';
import { getProductReviews, upsertReview, deleteReview } from '../controllers/reviewsController';
import { verifyAuthToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public read routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Reviews — public read; posting/deleting requires an account
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', verifyAuthToken, upsertReview);
router.delete('/:id/reviews/:reviewId', verifyAuthToken, deleteReview);

// Admin-only mutation routes (require a valid Firebase ID token + admin role)
router.post('/', verifyAuthToken, requireAdmin, createProduct);
router.put('/:id', verifyAuthToken, requireAdmin, updateProduct);
router.delete('/:id', verifyAuthToken, requireAdmin, deleteProduct);

export default router;
