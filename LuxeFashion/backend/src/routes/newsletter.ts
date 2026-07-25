import { Router } from 'express';
import { subscribe } from '../controllers/newsletterController';

const router = Router();

// Public — anyone can subscribe with just an email address.
router.post('/', subscribe);

export default router;
