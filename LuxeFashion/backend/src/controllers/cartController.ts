import { Request, Response } from 'express';
import { db } from '../config/firebase';

export interface CartItem {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
}

export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  updatedAt: string;
}

const COLLECTION = 'carts';

const recalc = (cart: Omit<Cart, 'id' | 'updatedAt'>) => {
  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.productPrice * i.quantity, 0);
  cart.itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
};

// Get or create cart for user
export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const docRef = db.collection(COLLECTION).doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      const newCart: Omit<Cart, 'id'> = {
        userId,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        updatedAt: new Date().toISOString()
      };
      await docRef.set(newCart);
      return res.json({ id: userId, ...newCart });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, productName, productPrice, productImage, quantity, size } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    const docRef = db.collection(COLLECTION).doc(userId);
    const doc = await docRef.get();

    const cart: Omit<Cart, 'id'> = doc.exists
      ? (doc.data() as Omit<Cart, 'id'>)
      : { userId, items: [], totalAmount: 0, itemCount: 0, updatedAt: new Date().toISOString() };

    const idx = cart.items.findIndex((i) => i.productId === productId && i.size === size);
    if (idx >= 0) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({ productId, productName, productPrice, productImage, quantity, size });
    }

    recalc(cart);
    cart.updatedAt = new Date().toISOString();
    await docRef.set(cart, { merge: true });

    res.json({ id: userId, ...cart });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, size, quantity } = req.body;

    if (!userId || !productId || quantity === undefined) {
      return res.status(400).json({ error: 'userId, productId, and quantity are required' });
    }

    const docRef = db.collection(COLLECTION).doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cart not found' });

    const cart = doc.data() as Omit<Cart, 'id'>;
    cart.items = cart.items
      .map((i) => (i.productId === productId && i.size === size ? { ...i, quantity: Math.max(0, quantity) } : i))
      .filter((i) => i.quantity > 0);

    recalc(cart);
    cart.updatedAt = new Date().toISOString();
    await docRef.update({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount, updatedAt: cart.updatedAt });

    res.json({ id: userId, ...cart });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, size } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    const docRef = db.collection(COLLECTION).doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cart not found' });

    const cart = doc.data() as Omit<Cart, 'id'>;
    cart.items = cart.items.filter((i) => !(i.productId === productId && i.size === size));

    recalc(cart);
    cart.updatedAt = new Date().toISOString();
    await docRef.update({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount, updatedAt: cart.updatedAt });

    res.json({ id: userId, ...cart });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const docRef = db.collection(COLLECTION).doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cart not found' });

    await docRef.update({ items: [], totalAmount: 0, itemCount: 0, updatedAt: new Date().toISOString() });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
};
