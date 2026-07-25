import { Router } from 'express';
import { getWishlist, putWishlist } from '../controllers/wishlistController';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

// Wishlist is always scoped to the token's uid — no userId params to spoof.
router.use(verifyAuthToken);

router.get('/', getWishlist);
router.put('/', putWishlist);

export default router;
