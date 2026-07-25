import { auth } from '../config/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  /** Gallery of angles — images[0] is the main angle (same as `image`). */
  images?: string[];
  sizes: string[];
  category: string;
  description?: string;
  stock?: number;
  /** Optional sale price — wins over price when 0 < salePrice < price. */
  salePrice?: number;
  ratingAvg?: number;
  ratingCount?: number;
  createdAt?: string;
}

export interface ProductInput {
  name: string;
  price: number;
  image: string;
  images?: string[];
  sizes: string[];
  category: string;
  description?: string;
  stock?: number;
  salePrice?: number;
}

// Attach the current Firebase ID token so the backend can authenticate the call.
const buildHeaders = async (): Promise<Record<string, string>> => {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseError = async (res: Response): Promise<never> => {
  let message = `Request failed (${res.status})`;
  try {
    const data = await res.json();
    if (data?.error) message = data.error;
  } catch {
    // response was not JSON
  }
  throw new Error(message);
};

export const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch('/api/products');
  if (!res.ok) await parseError(res);
  return res.json();
};

export const createProduct = async (input: ProductInput): Promise<Product> => {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

export const updateProduct = async (id: string, input: ProductInput): Promise<Product> => {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: await buildHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

export const deleteProduct = async (id: string): Promise<void> => {
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: await buildHeaders(),
  });
  if (!res.ok) await parseError(res);
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentProvider?: 'stripe' | 'manual';
  paymentIntentId?: string;
  paymentError?: string;
  createdAt?: string;
}

export type OrderInput = Omit<Order, 'id' | 'status' | 'paymentStatus' | 'createdAt'>;

export const createOrder = async (input: OrderInput): Promise<Order> => {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

export const fetchOrdersByUser = async (userId: string): Promise<Order[]> => {
  const res = await fetch(`/api/orders/user/${userId}`, {
    headers: await buildHeaders(),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

// ─── Payments ────────────────────────────────────────────────────────────────

export interface PaymentIntentRequest {
  items: Array<{ productId: string; quantity: number; size: string }>;
  shippingAddress: ShippingAddress;
  promoCode?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  totalAmount: number;
}

// Creates a Stripe PaymentIntent + a pending order server-side (prices are
// recomputed on the backend — the client never sets the amount).
export const createPaymentIntent = async (
  input: PaymentIntentRequest
): Promise<PaymentIntentResponse> => {
  const res = await fetch('/api/payments/create-intent', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

// ─── Newsletter ──────────────────────────────────────────────────────────────

export const subscribeNewsletter = async (
  email: string,
): Promise<{ message: string; alreadySubscribed: boolean }> => {
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};


// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  text: string;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchProductReviews = async (productId: string): Promise<Review[]> => {
  const res = await fetch(`/api/products/${productId}/reviews`);
  if (!res.ok) await parseError(res);
  return res.json();
};

// One review per user per product — posting again updates the existing review.
export const submitReview = async (
  productId: string,
  input: { rating: number; text: string }
): Promise<Review> => {
  const res = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};

export const deleteReviewApi = async (productId: string, reviewId: string): Promise<void> => {
  const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: await buildHeaders(),
  });
  if (!res.ok) await parseError(res);
};

// ─── Promo codes ─────────────────────────────────────────────────────────────

export interface PromoValidation {
  code: string;
  percentOff: number;
  discount: number;
  subtotal: number;
  total: number;
}

export const validatePromo = async (code: string, subtotal: number): Promise<PromoValidation> => {
  const res = await fetch('/api/promo/validate', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
};
