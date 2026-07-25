import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { verifyAuthToken, requireSelfOrAdmin } from '../middleware/auth';

const router = Router();

// All cart routes require a valid Firebase ID token; the :userId must match the
// token's uid (or belong to an admin). The check runs as route-level middleware —
// a router.use() guard never sees :userId because req.params is per matched route.
router.use(verifyAuthToken);

const selfOrAdmin = requireSelfOrAdmin('userId');

router.get('/:userId', selfOrAdmin, getCart);
router.post('/:userId/add', selfOrAdmin, addToCart);
router.put('/:userId/update', selfOrAdmin, updateCartItem);
router.post('/:userId/remove', selfOrAdmin, removeFromCart);
router.post('/:userId/clear', selfOrAdmin, clearCart);

export default router;
