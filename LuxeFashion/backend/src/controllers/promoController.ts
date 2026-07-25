import { Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const PROMOS = 'promoCodes';

export interface PromoCode {
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt?: string | null;
  minSubtotal?: number | null;
}

export type PromoResult =
  | { code: string; percentOff: number; discount: number }
  | { error: string };

// Shared validation — used by the /api/promo/validate endpoint AND by the
// payments flow, so a code can never be applied client-side only.
// Codes live in the promoCodes collection (managed via the Firebase console):
// { code: "WELCOME10", percentOff: 10, active: true, expiresAt: null, minSubtotal: 50 }
export const checkPromoCode = async (code: string, subtotal: number): Promise<PromoResult> => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { error: 'Enter a promo code' };

  const snap = await db.collection(PROMOS).where('code', '==', normalized).limit(1).get();
  if (snap.empty) return { error: 'That promo code is not valid' };

  const promo = snap.docs[0].data() as PromoCode;
  if (!promo.active) return { error: 'That promo code is no longer active' };
  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
    return { error: 'That promo code has expired' };
  }
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    return { error: `This code needs a subtotal of at least $${Number(promo.minSubtotal).toFixed(2)}` };
  }

  const percentOff = Math.min(90, Math.max(1, Number(promo.percentOff) || 0));
  const discount = Math.round(subtotal * (percentOff / 100) * 100) / 100;
  return { code: normalized, percentOff, discount };
};

// POST /api/promo/validate — authenticated (checkout requires an account anyway).
export const validatePromo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body as { code?: unknown; subtotal?: unknown };
    const sub = Math.max(0, Number(subtotal) || 0);
    const result = await checkPromoCode(String(code || ''), sub);
    if ('error' in result) return res.status(400).json(result);

    res.json({
      ...result,
      subtotal: sub,
      total: Math.round((sub - result.discount) * 100) / 100,
    });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: error.message });
  }
};
