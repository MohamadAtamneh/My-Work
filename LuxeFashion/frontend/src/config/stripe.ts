import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

// null when the key isn't configured — the checkout shows a "payments
// unavailable" notice instead of a broken card form.
export const paymentsConfigured = Boolean(publishableKey);
export const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
