import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest, getUserRole } from '../middleware/auth';
import { priceCartItems } from '../utils/pricing';

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  /** 'stripe' for orders created via /api/payments/create-intent. */
  paymentProvider?: 'stripe' | 'manual';
  /** Stripe PaymentIntent id — links the order to the charge for the webhook. */
  paymentIntentId?: string;
  /** Last payment error message, if the charge failed. */
  paymentError?: string;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION = 'orders';

const VALID_PAYMENT_METHODS: Order['paymentMethod'][] = ['credit_card', 'paypal', 'bank_transfer'];

// Create new order. Security rules enforced here (route only applies verifyAuthToken):
// - userId ALWAYS comes from the verified token, never from the request body
// - item prices and the total are recomputed from the products collection —
//   the client-sent prices/total are ignored so nobody can order a $500 coat for $1
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Authentication required' });

    const { items, shippingAddress, paymentMethod } = req.body as Partial<Order>;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    const addr = shippingAddress as Order['shippingAddress'] | undefined;
    if (!addr?.name || !addr?.email || !addr?.address || !addr?.city || !addr?.zipCode || !addr?.country) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    // Rebuild every line item from Firestore product data (name/price/image server-side).
    let priced;
    try {
      priced = await priceCartItems(items);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    const now = new Date().toISOString();
    const newOrder: Omit<Order, 'id'> = {
      userId: uid,
      items: priced.items,
      totalAmount: priced.totalAmount,
      shippingAddress: {
        name: String(addr.name),
        email: String(addr.email),
        phone: String(addr.phone || ''),
        address: String(addr.address),
        city: String(addr.city),
        zipCode: String(addr.zipCode),
        country: String(addr.country)
      },
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await db.collection(COLLECTION).add(newOrder);
    const doc = await docRef.get();
    res.status(201).json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders by user
export const getOrdersByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const snapshot = await db.collection(COLLECTION).where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error: any) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID — only the order's owner or an admin may read it (checked here
// because we need the document before we know who it belongs to).
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = doc.data() as Order;
    if (order.userId !== req.user?.uid) {
      const role = req.user?.uid ? await getUserRole(req.user.uid) : 'customer';
      if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: you can only access your own orders' });
      }
    }

    res.json({ id: doc.id, ...order });
  } catch (error: any) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });

    await docRef.update({ status, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();
    res.json({ message: 'Order status updated', status, order: { id: updated.id, ...updated.data() } });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error: any) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ error: error.message });
  }
};
