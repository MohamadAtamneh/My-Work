import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const verifyAuthToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Read the caller's role from the Firestore users/{uid} document.
export const getUserRole = async (uid: string): Promise<'admin' | 'customer'> => {
  const doc = await db.collection('users').doc(uid).get();
  const role = doc.exists ? (doc.data() as { role?: string } | undefined)?.role : undefined;
  return role === 'admin' ? 'admin' : 'customer';
};

// Gate a route to admin users only. Must run after verifyAuthToken so req.user is set.
export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const role = await getUserRole(req.user.uid);

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error: any) {
    console.error('requireAdmin error:', error.message);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Gate a route so users can only touch their OWN resources (admins can access anyone's).
// Must run as route-level middleware (after param parsing) — a router.use() guard never
// sees :userId because Express populates req.params per matched route, not for .use().
export const requireSelfOrAdmin = (paramKey = 'userId') =>
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const requested = req.params[paramKey];
      if (requested && requested !== req.user.uid) {
        const role = await getUserRole(req.user.uid);
        if (role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: you can only access your own data' });
        }
      }

      next();
    } catch (error: any) {
      console.error('requireSelfOrAdmin error:', error.message);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };

