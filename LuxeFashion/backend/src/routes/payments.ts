import { Router } from 'express';
import { createPaymentIntent, handleStripeWebhook } from '../controllers/paymentsController';
import { verifyAuthToken } from '../middleware/auth';

const router = Router();

router.post('/create-intent', verifyAuthToken, createPaymentIntent);

// No auth token here — Stripe calls this. Authenticity is proven by the
// signature check inside the controller, and the raw body is mounted in server.ts.
router.post('/webhook', handleStripeWebhook);

export default router;
