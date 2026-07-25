import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest, getUserRole } from '../middleware/auth';

const REVIEWS = 'reviews';
const PRODUCTS = 'products';
const ORDERS = 'orders';
const USERS = 'users';

// GET /api/products/:id/reviews — public. Sorted in memory to avoid needing a
// composite Firestore index.
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snap = await db.collection(REVIEWS).where('productId', '==', id).get();
    const reviews = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    res.json(reviews);
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/products/:id/reviews — authenticated. One review per user per
// product: the deterministic doc id makes repeat posts an update, not a dupe.
export const upsertReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    if (!uid) return res.status(401).json({ error: 'Authentication required' });

    const { id: productId } = req.params;
    const { rating, text } = req.body as { rating?: unknown; text?: unknown };

    const productDoc = await db.collection(PRODUCTS).doc(productId).get();
    if (!productDoc.exists) return res.status(404).json({ error: 'Product not found' });

    const ratingNum = Math.round(Number(rating));
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const reviewText = String(text || '').trim();
    if (reviewText.length < 3) {
      return res.status(400).json({ error: 'Please write a few words with your rating' });
    }
    if (reviewText.length > 1000) {
      return res.status(400).json({ error: 'Review is too long (max 1000 characters)' });
    }

    // Verified purchase = the user has a PAID order containing this product.
    const ordersSnap = await db.collection(ORDERS).where('userId', '==', uid).get();
    const verifiedPurchase = ordersSnap.docs.some((d) => {
      const order = d.data();
      return (
        order.paymentStatus === 'paid' &&
        Array.isArray(order.items) &&
        order.items.some((i: any) => i?.productId === productId)
      );
    });

    const userDoc = await db.collection(USERS).doc(uid).get();
    const authorName =
      (userDoc.data()?.displayName as string | undefined) ||
      email?.split('@')[0] ||
      'Customer';

    const docRef = db.collection(REVIEWS).doc(`${productId}_${uid}`);
    const existing = await docRef.get();
    const now = new Date().toISOString();

    await docRef.set({
      productId,
      userId: uid,
      authorName,
      rating: ratingNum,
      text: reviewText,
      verifiedPurchase,
      createdAt: existing.exists ? existing.data()?.createdAt : now,
      updatedAt: now,
    });

    await recalcProductRating(productId);

    const saved = await docRef.get();
    res.status(existing.exists ? 200 : 201).json({ id: saved.id, ...saved.data() });
  } catch (error: any) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/products/:id/reviews/:reviewId — own review, or any review as admin.
export const deleteReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Authentication required' });

    const { id: productId, reviewId } = req.params;
    const docRef = db.collection(REVIEWS).doc(reviewId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data()?.productId !== productId) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (doc.data()?.userId !== uid) {
      const role = await getUserRole(uid);
      if (role !== 'admin') {
        return res.status(403).json({ error: 'You can only delete your own reviews' });
      }
    }

    await docRef.delete();
    await recalcProductRating(productId);
    res.json({ message: 'Review deleted' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Keep the denormalized ratingAvg / ratingCount on the product doc in sync.
const recalcProductRating = async (productId: string) => {
  const snap = await db.collection(REVIEWS).where('productId', '==', productId).get();
  const count = snap.size;
  const avg = count
    ? snap.docs.reduce((sum, d) => sum + (Number(d.data().rating) || 0), 0) / count
    : 0;
  await db.collection(PRODUCTS).doc(productId).update({
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
};
