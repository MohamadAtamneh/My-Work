import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentIntent, validatePromo, ShippingAddress } from '../services/api';
import { paymentsConfigured, stripePromise } from '../config/stripe';

// Shared form styling — matches the LuxeFashion design system (ink/border/surface).
const inputClass =
  'w-full border border-border rounded-xl px-4 py-3 text-sm bg-white text-ink ' +
  'placeholder:text-muted focus:outline-none focus:border-ink transition-colors';
const labelClass = 'block text-xs uppercase tracking-widest text-ink font-medium mb-2';

const EMPTY_ADDRESS: ShippingAddress = {
  name: '', email: '', phone: '', address: '', city: '', zipCode: '', country: '',
};

type Stage = 'cart' | 'checkout' | 'payment' | 'done';

// Card form — must render INSIDE <Elements> so the Stripe hooks work.
function PaymentForm({ total, onPaid }: { total: number; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || paying) return;
    setPaying(true);
    setError(null);

    const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });

    if (result.error) {
      setError(result.error.message || 'Payment failed — please try again.');
      setPaying(false);
    } else if (result.paymentIntent?.status === 'succeeded') {
      onPaid();
    } else {
      setError('Payment was not completed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || paying}
        className="btn-primary w-full !py-4 disabled:opacity-50"
      >
        {paying ? 'Processing…' : 'Pay $' + total.toFixed(2)}
      </button>
      <div
        className="flex items-center justify-center gap-2 text-xs text-muted"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        <span aria-hidden="true">🔒</span> Payments are encrypted and processed securely by Stripe.
      </div>
      {import.meta.env.DEV && (
        <p className="text-xs text-muted text-center" style={{ fontFamily: 'var(--font-body)' }}>
          Test mode: card 4242 4242 4242 4242, any future date, any CVC/ZIP.
        </p>
      )}
    </form>
  );
}
function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();

  const [stage, setStage] = useState<Stage>('cart');
  const [authNotice, setAuthNotice] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);

  // Stripe payment state — set once the pending order + PaymentIntent exist.
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payableTotal, setPayableTotal] = useState(0);

  // Promo code — validated against the backend; Stripe charges the discounted total.
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percentOff: number; discount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplying, setPromoApplying] = useState(false);

  const setField = (key: keyof ShippingAddress, value: string) =>
    setAddress((a) => ({ ...a, [key]: value }));

  // Checkout requires an account — the backend ties orders to the user id.
  const startCheckout = () => {
    if (!user) {
      setAuthNotice(true);
      return;
    }
    setAuthNotice(false);
    setOrderError(null);
    setAddress((a) => ({
      ...a,
      name: a.name || user.displayName || '',
      email: a.email || user.email || '',
    }));
    setStage('checkout');
  };

  // Address form → create the PaymentIntent + pending order, then show the card form.
  const startPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthNotice(true);
      setStage('cart');
      return;
    }
    setPlacing(true);
    setOrderError(null);
    try {
      const payment = await createPaymentIntent({
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        shippingAddress: address,
        promoCode: appliedPromo?.code,
      });
      setClientSecret(payment.clientSecret);
      setPlacedOrderId(payment.orderId);
      setPayableTotal(payment.totalAmount);
      setStage('payment');
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Could not start payment — please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // Payment confirmed by Stripe — the webhook marks the order paid server-side.
  const handlePaid = () => {
    clearCart();
    setClientSecret(null);
    setAppliedPromo(null);
    setPromoError(null);
    setStage('done');
  };

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code || promoApplying) return;
    setPromoApplying(true);
    setPromoError(null);
    try {
      const result = await validatePromo(code, total);
      setAppliedPromo({ code: result.code, percentOff: result.percentOff, discount: result.discount });
      setPromoInput('');
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err instanceof Error ? err.message : 'Invalid promo code');
    } finally {
      setPromoApplying(false);
    }
  };

  const displayTotal = appliedPromo ? Math.max(0, total - appliedPromo.discount) : total;

  // ── Order placed ───────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-8 py-40 text-center">
          <div className="mx-auto mb-8 w-16 h-16 rounded-full bg-ink text-white flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl text-ink mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Thank you<em style={{ color: '#6F6F6F' }}>.</em>
          </h1>
          <p className="text-muted mb-2 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Your payment was successful — your order is confirmed.
          </p>
          {placedOrderId && (
            <p className="text-muted mb-10 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
              Order reference: <span className="text-ink font-medium">#{placedOrderId.slice(0, 8).toUpperCase()}</span>
              {' '}— track it any time from your Account page.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
            <Link to="/account" className="btn-secondary">View Order History</Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-8 py-40 text-center">
          <h1 className="text-4xl md:text-5xl text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            Your Cart is Empty
          </h1>
          <p className="text-muted mb-10 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
            Looks like you haven't added anything yet.
          </p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  // ── Cart / checkout ────────────────────────────────────────────────────────
  return (
    <Layout>
      <Seo
        title="Your Cart"
        description="Review your selected pieces and check out securely."
        path="/cart"
        noindex
      />
      <div className="max-w-7xl mx-auto px-8 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted mb-2"
            style={{ fontFamily: 'var(--font-body)' }}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <h1 className="text-4xl md:text-5xl text-ink"
            style={{ fontFamily: 'var(--font-display)' }}>
            {stage === 'cart' ? 'Your Cart' : 'Checkout'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {stage === 'cart' ? (
            /* ── Cart items ─────────────────────────────────────────────── */
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id}
                  className="flex items-center gap-5 p-4 border border-border rounded-2xl bg-white">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-28 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <h3 className="text-base text-ink mb-1 truncate"
                      style={{ fontFamily: 'var(--font-display)' }}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted mb-3"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      Size: {item.size}
                    </p>
                    <p className="text-sm font-medium text-ink"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-border text-ink hover:bg-surface
                        transition-colors flex items-center justify-center text-sm"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="w-6 text-center text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-border text-ink hover:bg-surface
                        transition-colors flex items-center justify-center text-sm"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted hover:text-ink transition-colors text-xs flex-shrink-0"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-muted hover:text-ink transition-colors mt-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Clear cart
              </button>
            </div>
          ) : stage === 'checkout' ? (
            <div className="lg:col-span-2">
              {/* ── Shipping form ────────────────────────────────────────── */}
              <button
                type="button"
                onClick={() => setStage('cart')}
                className="text-sm text-muted hover:text-ink transition-colors mb-8 inline-flex items-center gap-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                ← Back to Cart
              </button>

              <form id="checkout-form" onSubmit={startPayment} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="ship-name" className={labelClass}>Full Name</label>
                    <input id="ship-name" className={inputClass} required
                      value={address.name} onChange={(e) => setField('name', e.target.value)}
                      placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label htmlFor="ship-email" className={labelClass}>Email</label>
                    <input id="ship-email" type="email" className={inputClass} required
                      value={address.email} onChange={(e) => setField('email', e.target.value)}
                      placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="ship-phone" className={labelClass}>Phone</label>
                    <input id="ship-phone" type="tel" className={inputClass} required
                      value={address.phone} onChange={(e) => setField('phone', e.target.value)}
                      placeholder="+1 555 000 0000" />
                  </div>
                  <div>
                    <label htmlFor="ship-country" className={labelClass}>Country</label>
                    <input id="ship-country" className={inputClass} required
                      value={address.country} onChange={(e) => setField('country', e.target.value)}
                      placeholder="United States" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="ship-address" className={labelClass}>Street Address</label>
                    <input id="ship-address" className={inputClass} required
                      value={address.address} onChange={(e) => setField('address', e.target.value)}
                      placeholder="123 Main Street, Apt 4" />
                  </div>
                  <div>
                    <label htmlFor="ship-city" className={labelClass}>City</label>
                    <input id="ship-city" className={inputClass} required
                      value={address.city} onChange={(e) => setField('city', e.target.value)}
                      placeholder="New York" />
                  </div>
                  <div>
                    <label htmlFor="ship-zip" className={labelClass}>ZIP / Postal Code</label>
                    <input id="ship-zip" className={inputClass} required
                      value={address.zipCode} onChange={(e) => setField('zipCode', e.target.value)}
                      placeholder="10001" />
                  </div>
                </div>

                {orderError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {orderError}
                  </p>
                )}
              </form>
            </div>
          ) : (
            /* ── Payment (Stripe) ─────────────────────────────────────────── */
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => setStage('checkout')}
                className="text-sm text-muted hover:text-ink transition-colors mb-8 inline-flex items-center gap-2"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                ← Back to Address
              </button>

              <h2 className="text-xl text-ink mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                Payment Details
              </h2>
              <p className="text-sm text-muted mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                Shipping to {address.name}, {address.address}, {address.city}, {address.country}
              </p>

              {clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm total={payableTotal} onPaid={handlePaid} />
                </Elements>
              ) : (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  Payments are not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to frontend/.env
                  and the Stripe secret keys to backend/.env, then restart both servers.
                </p>
              )}
            </div>
          )}
          {/* ── Order summary ──────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-2xl p-6 sticky top-28">
              <h2 className="text-xl text-ink mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Order Summary
              </h2>
              <div className="space-y-3 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-ink">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="text-ink">Free</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between">
                    <span className="text-muted">Promo ({appliedPromo.code})</span>
                    <span className="text-ink">-{'$' + appliedPromo.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Taxes</span>
                  <span className="text-ink">Calculated at checkout</span>
                </div>
              </div>
              <div className="divider my-5" />
              <div className="flex justify-between text-base font-medium mb-6"
                style={{ fontFamily: 'var(--font-body)' }}>
                <span className="text-ink">Total</span>
                <span className="text-ink">${displayTotal.toFixed(2)}</span>
              </div>

              {/* Promo code — hidden on the payment stage (already priced in) */}
              {stage !== 'payment' && (
                <div className="mb-6">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between text-sm border border-border rounded-xl px-4 py-3"
                      style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="text-ink font-medium">
                        {appliedPromo.code} (−{appliedPromo.percentOff}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-xs text-muted hover:text-ink transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          if (promoError) setPromoError(null);
                        }}
                        placeholder="Promo code"
                        aria-label="Promo code"
                        className="flex-grow min-w-0 border border-border rounded-xl px-4 py-2.5 text-sm bg-white text-ink
                          placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
                      />
                      <button
                        type="button"
                        onClick={applyPromo}
                        disabled={promoApplying || !promoInput.trim()}
                        className="btn-secondary !py-2.5 !px-4 !text-sm disabled:opacity-50"
                      >
                        {promoApplying ? '…' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-xs text-red-600 mt-2" style={{ fontFamily: 'var(--font-body)' }}>
                      {promoError}
                    </p>
                  )}
                </div>
              )}

              {stage === 'cart' ? (
                <>
                  <button onClick={startCheckout} className="btn-primary w-full !py-4">
                    Proceed to Checkout
                  </button>
                  {authNotice && (
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                        You need an account to place an order.
                      </p>
                      <Link to="/account" className="btn-secondary w-full !py-3 text-center">
                        Sign In / Register
                      </Link>
                    </div>
                  )}
                </>
              ) : stage === 'checkout' ? (
                <>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={placing || !paymentsConfigured}
                    className="btn-primary w-full !py-4 disabled:opacity-50"
                  >
                    {placing ? 'Preparing Payment…' : 'Continue to Payment'}
                  </button>
                  {!paymentsConfigured && (
                    <p className="mt-3 text-xs text-red-600 text-center" style={{ fontFamily: 'var(--font-body)' }}>
                      Payments aren't configured yet — add your Stripe keys to both .env files.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted text-center" style={{ fontFamily: 'var(--font-body)' }}>
                  Complete your purchase with the secure card form.
                </p>
              )}

              <Link
                to="/shop"
                className="btn-secondary w-full !py-3 mt-3 text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Cart;
