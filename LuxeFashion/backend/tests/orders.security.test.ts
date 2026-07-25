import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// In-memory stand-ins for Firestore data
const ORDERS: any[] = [
  { id: 'o1', userId: 'user-a', items: [], totalAmount: 100, status: 'pending', createdAt: '2024-01-01' },
  { id: 'o2', userId: 'user-b', items: [], totalAmount: 50, status: 'pending', createdAt: '2024-01-02' },
];
const PRODUCTS: Record<string, any> = {
  p1: { name: 'Essential Tee', price: 50, image: 'img' },
};

vi.mock('../src/config/firebase', () => ({
  auth: {
    verifyIdToken: async (token: string) => {
      if (token === 'token-a') return { uid: 'user-a', email: 'a@example.com' };
      if (token === 'token-b') return { uid: 'user-b', email: 'b@example.com' };
      throw new Error('invalid token');
    },
  },
  db: {
    collection: (name: string) => {
      if (name === 'orders') {
        return {
          where: (_field: string, _op: string, value: string) => ({
            orderBy: () => ({
              get: async () => ({
                docs: ORDERS.filter((o) => o.userId === value).map((o) => ({
                  id: o.id,
                  data: () => ({ ...o }),
                })),
              }),
            }),
          }),
          add: async (doc: any) => {
            const id = 'new-order';
            return { id, get: async () => ({ id, data: () => doc }) };
          },
        };
      }
      if (name === 'products') {
        return {
          doc: (id: string) => ({
            get: async () => ({ exists: id in PRODUCTS, data: () => PRODUCTS[id] }),
          }),
        };
      }
      if (name === 'users') {
        return {
          doc: () => ({ get: async () => ({ exists: true, data: () => ({ role: 'customer' }) }) }),
        };
      }
      throw new Error('unexpected collection: ' + name);
    },
  },
}));

import app from '../src/server';

describe('order routes — ownership enforcement', () => {
  it('rejects unauthenticated requests (401)', async () => {
    await request(app).get('/api/orders/user/user-a').expect(401);
  });

  it('serves a user their own orders (200)', async () => {
    const res = await request(app)
      .get('/api/orders/user/user-a')
      .set('Authorization', 'Bearer token-a')
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe('user-a');
  });

  it("blocks reading another user's orders (403) — IDOR regression", async () => {
    await request(app)
      .get('/api/orders/user/user-b')
      .set('Authorization', 'Bearer token-a')
      .expect(403);
  });

  it('ignores body userId on create and recomputes the total server-side', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer token-a')
      .send({
        userId: 'user-b', // spoof attempt — must be overridden by the token
        items: [{ productId: 'p1', productPrice: 0.01, quantity: 2, size: 'M' }],
        shippingAddress: {
          name: 'A', email: 'a@example.com', address: '1 Main St',
          city: 'NYC', zipCode: '10001', country: 'US',
        },
        paymentMethod: 'credit_card',
      });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe('user-a');
    // 2 × 50 from the products collection — NOT 2 × 0.01 from the request body
    expect(res.body.totalAmount).toBe(100);
    expect(res.body.items[0].productPrice).toBe(50);
  });
});
