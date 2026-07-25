import { Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';
import { priceCartItems } from '../utils/pricing';
import { checkPromoCode } from './promoController';

const ORDERS = 'orders';
const PRODUCTS = 'products';

// Stripe is optional in local dev — payment endpoints return 503 until keys are set.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const MIN_CHARGE_CENTS = 50; // Stripe's minimum charge amount (USD)

interface ShippingAddressInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

// Create a PaymentIntent + a pending order for the caller's cart.
// Prices/totals are recomputed server-side from the products collection.
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payments are not configured on the server' });
    }
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { items, shippingAddress, promoCode } = req.body as {
      items?: Array<{ productId?: unknown; quantity?: unknown; size?: unknown }>;
      shippingAddress?: ShippingAddressInput;
      promoCode?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    const addr = shippingAddress || {};
    if (!addr.name || !addr.email || !addr.address || !addr.city || !addr.zipCode || !addr.country) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    let priced;
    try {
      priced = await priceCartItems(items);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Optional promo code — validated server-side against the recomputed subtotal.
    const subtotal = priced.totalAmount;
    let discount = 0;
    let appliedPromo: string | null = null;
    if (promoCode && String(promoCode).trim()) {
      const result = await checkPromoCode(String(promoCode), subtotal);
      if ('error' in result) {
        return res.status(400).json({ error: result.error });
      }
      discount = result.discount;
      appliedPromo = result.code;
    }
    const totalAmount = Math.round((subtotal - discount) * 100) / 100;

    const amountCents = Math.round(totalAmount * 100);
    if (amountCents < MIN_CHARGE_CENTS) {
      return res.status(400).json({ error: 'Order total is below the minimum charge amount' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { userId: uid }
    });

    const now = new Date().toISOString();
    const orderDoc = await db.collection(ORDERS).add({
      userId: uid,
      items: priced.items,
      subtotal,
      discount,
      promoCode: appliedPromo,
      totalAmount,
      shippingAddress: {
        name: String(addr.name),
        email: String(addr.email),
        phone: String(addr.phone || ''),
        address: String(addr.address),
        city: String(addr.city),
        zipCode: String(addr.zipCode),
        country: String(addr.country)
      },
      paymentMethod: 'credit_card',
      paymentProvider: 'stripe',
      paymentIntentId: intent.id,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now
    });

    // Link the intent back to the order so the webhook can find it fast.
    await stripe.paymentIntents.update(intent.id, {
      metadata: { userId: uid, orderId: orderDoc.id }
    });

    res.status(201).json({
      clientSecret: intent.client_secret,
      orderId: orderDoc.id,
      totalAmount,
      subtotal,
      discount
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};


// Stripe webhook — mounted with express.raw() in server.ts so the signature can
// be verified against the untouched request body.
export const handleStripeWebhook = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Payments are not configured on the server' });
  }
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: 'Stripe webhook is not configured' });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await markOrderPaid((event.data.object as Stripe.PaymentIntent).id);
        break;
      case 'payment_intent.payment_failed':
        await recordPaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break; // other event types are acknowledged and ignored
    }
    res.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Idempotent — Stripe may deliver the same event more than once.
const markOrderPaid = async (paymentIntentId: string) => {
  const snap = await db
    .collection(ORDERS)
    .where('paymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();
  if (snap.empty) {
    console.warn(`No order found for PaymentIntent ${paymentIntentId}`);
    return;
  }

  const orderDoc = snap.docs[0];
  const order = orderDoc.data() as {
    paymentStatus?: string;
    items?: Array<{ productId: string; quantity: number }>;
  };
  if (order.paymentStatus === 'paid') return;

  await orderDoc.ref.update({
    paymentStatus: 'paid',
    status: 'processing',
    updatedAt: new Date().toISOString()
  });

  // Decrement stock for products that track it.
  for (const item of order.items || []) {
    if (!item.productId) continue;
    const productRef = db.collection(PRODUCTS).doc(item.productId);
    const productDoc = await productRef.get();
    const stock = productDoc.data()?.stock;
    if (typeof stock === 'number') {
      await productRef.update({ stock: Math.max(0, stock - (item.quantity || 1)) });
    }
  }
};

// A failed charge shouldn't cancel the order (the customer may retry) — just
// record what happened so it shows up for support/admin.
const recordPaymentFailure = async (intent: Stripe.PaymentIntent) => {
  const snap = await db
    .collection(ORDERS)
    .where('paymentIntentId', '==', intent.id)
    .limit(1)
    .get();
  if (snap.empty) return;

  await snap.docs[0].ref.update({
    paymentError: intent.last_payment_error?.message || 'Payment failed',
    updatedAt: new Date().toISOString()
  });
};
