import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Seo from '../components/Seo';
import { useAuth } from '../contexts/AuthContext';
import { fetchOrdersByUser, Order } from '../services/api';

const friendlyError = (err: unknown): string => {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password is too weak (minimum 6 characters).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/user-not-found':
      return 'No account found with that email.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
    case 'auth/admin-restricted-operation':
      return 'Email/password sign-in is not enabled. Enable it in the Firebase console (Authentication → Sign-in method → Email/Password).';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed';
  }
};

// Shared form styling — matches the LuxeFashion design system (ink/border/surface).
const inputClass =
  'w-full border border-border rounded-xl px-4 py-3 text-sm bg-white text-ink ' +
  'placeholder:text-muted focus:outline-none focus:border-ink transition-colors';
const labelClass = 'block text-xs uppercase tracking-widest text-ink font-medium mb-2';

const STATUS_STYLES: Record<string, string> = {
  pending: 'border border-border text-muted',
  processing: 'border border-ink text-ink',
  shipped: 'border border-ink text-ink',
  delivered: 'bg-ink text-white',
  cancelled: 'border border-border text-muted line-through',
};

function Account() {
  const { user, role, loading, signIn, signInWithGoogle, signUp, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real order history for the signed-in user.
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders(null);
      return;
    }
    let cancelled = false;
    fetchOrdersByUser(user.uid)
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setOrdersError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOrdersError(err instanceof Error ? err.message : 'Failed to load orders');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleGoogleSignIn = async () => {
    setMessage(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setMessage(
        code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request'
          ? 'Sign-in popup was closed before completing.'
          : friendlyError(err)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name.trim());
      }
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setMessage(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-40">
          <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  // ── Signed-in: profile + real order history ──────────────────────────────
  if (user) {
    const firstName = user.displayName?.split(' ')[0] || 'there';
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-8 py-20">

          {/* Header */}
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-muted mb-3"
              style={{ fontFamily: 'var(--font-body)' }}>
              Account
            </p>
            <h1 className="text-4xl md:text-5xl text-ink"
              style={{ fontFamily: 'var(--font-display)' }}>
              Hello, <em style={{ color: '#6F6F6F' }}>{firstName}.</em>
            </h1>
          </div>

          {/* Profile card */}
          <div className="card p-8 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}`
                }
                alt={user.displayName || 'Profile'}
                className="w-20 h-20 rounded-full border border-border object-cover"
              />
              <div className="flex-grow">
                <h2 className="text-2xl text-ink mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {user.displayName || 'LuxeFashion Member'}
                </h2>
                <p className="text-sm text-muted mb-3" style={{ fontFamily: 'var(--font-body)' }}>
                  {user.email}
                </p>
                <span
                  className={`inline-block text-[11px] uppercase tracking-widest px-3 py-1 rounded-full ${
                    role === 'admin' ? 'bg-ink text-white' : 'bg-surface text-muted border border-border'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {role || 'customer'}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                {role === 'admin' && (
                  <Link to="/admin" className="btn-primary !py-2.5 !px-6 !text-sm">
                    Manage Products
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-secondary !py-2.5 !px-6 !text-sm">
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Order history */}
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
              Order History
            </h2>
            {orders && orders.length > 0 && (
              <p className="text-xs uppercase tracking-widest text-muted"
                style={{ fontFamily: 'var(--font-body)' }}>
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            )}
          </div>

          {ordersError ? (
            <p className="text-sm text-red-600">{ordersError}</p>
          ) : orders === null ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-[1.5px] border-ink border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-muted text-sm mb-6" style={{ fontFamily: 'var(--font-body)' }}>
                No orders yet — your purchases will appear here.
              </p>
              <Link to="/shop" className="btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-medium text-ink" style={{ fontFamily: 'var(--font-body)' }}>
                        Order #{order.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted" style={{ fontFamily: 'var(--font-body)' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric',
                        }) : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-widest px-3 py-1 rounded-full capitalize ${
                        STATUS_STYLES[order.status || 'pending'] || STATUS_STYLES.pending
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {order.items.slice(0, 4).map((item) => (
                      <img
                        key={`${order.id}-${item.productId}-${item.size}`}
                        src={item.productImage}
                        alt={item.productName}
                        title={`${item.productName} (${item.size}) × ${item.quantity}`}
                        className="w-12 h-14 object-cover rounded-lg border border-border"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-xs text-muted">+{order.items.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                    <span className="text-muted">
                      {order.items.reduce((n, i) => n + i.quantity, 0)} items
                    </span>
                    <span className="text-ink font-medium">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ── Signed-out: login / register ───────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-md mx-auto px-8 py-20">

        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-muted mb-3"
            style={{ fontFamily: 'var(--font-body)' }}>
            Account
          </p>
          <h1 className="text-4xl md:text-5xl text-ink mb-4"
            style={{ fontFamily: 'var(--font-display)' }}>
            {mode === 'login' ? (
              <>Welcome <em style={{ color: '#6F6F6F' }}>back.</em></>
            ) : (
              <>Join <em style={{ color: '#6F6F6F' }}>LuxeFashion.</em></>
            )}
          </h1>
          <p className="text-muted text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}>
            {mode === 'login'
              ? 'Sign in to track orders and check out faster.'
              : 'Create an account to track orders and check out faster.'}
          </p>
        </div>

        <div className="card p-8">
          {/* Mode toggle — pill switch */}
          <div className="flex bg-surface rounded-full p-1 mb-8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  mode === m ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label htmlFor="account-name" className={labelClass}>Name</label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label htmlFor="account-email" className={labelClass}>Email</label>
              <input
                id="account-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="account-password" className={labelClass}>Password</label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className={inputClass}
              />
            </div>

            {message && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {message}
              </p>
            )}

            <button type="submit" disabled={submitting}
              className="btn-primary w-full !py-3.5 disabled:opacity-50">
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <span className="flex-grow h-px bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted"
              style={{ fontFamily: 'var(--font-body)' }}>
              or
            </span>
            <span className="flex-grow h-px bg-border" />
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="btn-secondary w-full !py-3.5 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z"/>
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <Seo
          title="Account"
          description="Sign in to your LuxeFashion account to track orders and manage your wishlist."
          path="/account"
          noindex
        />

        {/* Switch mode */}
        <p className="text-center text-sm text-muted mt-8" style={{ fontFamily: 'var(--font-body)' }}>
          {mode === 'login' ? (
            <>
              New to LuxeFashion?{' '}
              <button type="button" onClick={() => { setMode('register'); setMessage(null); }}
                className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity">
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setMessage(null); }}
                className="text-ink underline underline-offset-4 hover:opacity-60 transition-opacity">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </Layout>
  );
}

export default Account;
