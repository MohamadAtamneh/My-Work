import { describe, it, expect, vi } from 'vitest';

const PROMOS: Record<string, any> = {
  WELCOME10: { code: 'WELCOME10', percentOff: 10, active: true },
  EXPIRED20: { code: 'EXPIRED20', percentOff: 20, active: true, expiresAt: '2020-01-01T00:00:00Z' },
  MIN50: { code: 'MIN50', percentOff: 15, active: true, minSubtotal: 50 },
};

vi.mock('../src/config/firebase', () => ({
  db: {
    collection: () => ({
      where: (_field: string, _op: string, value: string) => ({
        limit: () => ({
          get: async () => {
            const docs = PROMOS[value] ? [{ data: () => PROMOS[value] }] : [];
            return { empty: docs.length === 0, docs };
          },
        }),
      }),
    }),
  },
}));

import { checkPromoCode } from '../src/controllers/promoController';

describe('checkPromoCode', () => {
  it('applies a valid code (case-insensitive)', async () => {
    const result = await checkPromoCode('welcome10', 100);
    expect(result).toEqual({ code: 'WELCOME10', percentOff: 10, discount: 10 });
  });

  it('rejects an unknown code', async () => {
    const result = await checkPromoCode('NOTREAL', 100);
    expect(result).toHaveProperty('error');
  });

  it('rejects an expired code', async () => {
    const result = await checkPromoCode('EXPIRED20', 100);
    expect(result).toEqual({ error: 'That promo code has expired' });
  });

  it('enforces the minimum subtotal', async () => {
    const tooSmall = await checkPromoCode('MIN50', 30);
    expect(tooSmall).toHaveProperty('error');

    const ok = await checkPromoCode('MIN50', 100);
    expect(ok).toEqual({ code: 'MIN50', percentOff: 15, discount: 15 });
  });
});
