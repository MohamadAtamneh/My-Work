import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';

// Load environment variables
dotenv.config();

// Optional error monitoring — active only when SENTRY_DSN is set.
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}

// Import routes
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import authRouter from './routes/auth';
import newsletterRouter from './routes/newsletter';
import paymentsRouter from './routes/payments';
import wishlistRouter from './routes/wishlist';
import promoRouter from './routes/promo';

const app: Application = express();
const PORT = process.env.PORT || 4001;

// Stripe's webhook signature check needs the RAW request body — mount it before express.json().
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// CORS — only the configured frontend origin(s) may call the API cross-origin.
// (Same-origin calls via the Vite dev proxy are unaffected.)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limits on public/abuse-prone endpoints (per IP).
const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again later.' }
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/newsletter', newsletterLimiter, newsletterRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/promo', promoRouter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sentry's express error handler must run before our own error middleware.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Don't bind a port when imported by tests (supertest drives the app in-process).
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
