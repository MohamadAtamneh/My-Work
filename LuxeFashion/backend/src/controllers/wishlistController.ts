import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const USERS = 'users';
const MAX_ITEMS = 500;

// The wishlist lives on the users/{uid} document as a string array of product ids.
// Guests' wishlists stay in localStorage on the client and merge here on login.

export const getWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const doc = await db.collection(USERS).doc(req.user!.uid).get();
    const wishlist = doc.exists ? (doc.data()?.wishlist as unknown) : undefined;
    const productIds = Array.isArray(wishlist)
      ? wishlist.filter((id): id is string => typeof id === 'string')
      : [];
    res.json({ productIds });
  } catch (error: any) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ error: error.message });
  }
};

export const putWishlist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productIds } = req.body as { productIds?: unknown };
    if (!Array.isArray(productIds) || productIds.some((id) => typeof id !== 'string')) {
      return res.status(400).json({ error: 'productIds must be an array of strings' });
    }

    const trimmed = [...new Set(productIds as string[])].slice(0, MAX_ITEMS);
    await db.collection(USERS).doc(req.user!.uid).set(
      { wishlist: trimmed, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    res.json({ productIds: trimmed });
  } catch (error: any) {
    console.error('Error saving wishlist:', error);
    res.status(500).json({ error: error.message });
  }
};
