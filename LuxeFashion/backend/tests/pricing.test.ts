import { describe, it, expect, vi } from 'vitest';

const PRODUCTS: Record<string, any> = {
  p1: { name: 'Essential Tee', price: 50, image: 'img1' },
  p2: { name: 'Wool Coat', price: 200, salePrice: 150, image: 'img2' },
};

vi.mock('../src/config/firebase', () => ({
  db: {
    collection: () => ({
      doc: (id: string) => ({
        get: async () => ({
          exists: id in PRODUCTS,
          data: () => PRODUCTS[id],
        }),
      }),
    }),
  },
}));

import { priceCartItems } from '../src/utils/pricing';

describe('priceCartItems', () => {
  it('recomputes prices from Firestore — client-sent prices are ignored', async () => {
    const result = await priceCartItems([{ productId: 'p1', quantity: 2, size: 'M' }]);
    expect(result.items[0].productPrice).toBe(50);
    expect(result.totalAmount).toBe(100);
  });

  it('uses the sale price when one is set', async () => {
    const result = await priceCartItems([{ productId: 'p2', quantity: 1, size: 'L' }]);
    expect(result.items[0].productPrice).toBe(150);
    expect(result.totalAmount).toBe(150);
  });

  it('clamps quantity into the 1–99 range', async () => {
    const zero = await priceCartItems([{ productId: 'p1', quantity: 0, size: 'M' }]);
    expect(zero.items[0].quantity).toBe(1);

    const huge = await priceCartItems([{ productId: 'p1', quantity: 500, size: 'M' }]);
    expect(huge.items[0].quantity).toBe(99);
  });

  it('throws on an unknown product', async () => {
    await expect(priceCartItems([{ productId: 'nope', quantity: 1 }])).rejects.toThrow(
      'Unknown product'
    );
  });
});
