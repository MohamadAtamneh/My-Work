import { Router } from 'express';
import { validatePromo } from '../controllers/promoController';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

router.post('/validate', verifyAuthToken, validatePromo);

export default router;
