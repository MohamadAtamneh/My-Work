import { Router } from 'express';
import {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../controllers/ordersController';
import { verifyAuthToken, requireAdmin, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

// All order routes require a valid Firebase ID token.
router.use(verifyAuthToken);

// Ownership rules (the old router.use() guard never saw :userId — Express only
// populates req.params for matched routes, so these checks must be route-level):
// - createOrder forces userId from the token + recomputes totals server-side
// - /user/:userId is limited to the caller themselves (or an admin)
// - /:id checks the order's owner inside the controller (needs the doc first)
router.post('/', createOrder);
router.get('/user/:userId', requireSelfOrAdmin('userId'), getOrdersByUser);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.get('/', requireAdmin, getAllOrders);

export default router;
