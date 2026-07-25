import { ReactNode } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../contexts/CartContext';

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

const TEE = { productId: 'p1', name: 'Essential Tee', price: 50, image: 'img', quantity: 1, size: 'M' };

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items and computes totals', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(TEE));
    act(() => result.current.addToCart({ ...TEE, productId: 'p2', price: 100, quantity: 2 }));

    expect(result.current.cart).toHaveLength(2);
    expect(result.current.itemCount).toBe(3);
    expect(result.current.total).toBe(250);
  });

  it('merges the same product+size into one line', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(TEE));
    act(() => result.current.addToCart(TEE));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('keeps different sizes as separate lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(TEE));
    act(() => result.current.addToCart({ ...TEE, size: 'L' }));

    expect(result.current.cart).toHaveLength(2);
  });

  it('never drops quantity below 1, and removes lines', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(TEE));
    const id = result.current.cart[0].id;
    act(() => result.current.updateQuantity(id, 0));
    expect(result.current.cart[0].quantity).toBe(1);

    act(() => result.current.removeFromCart(id));
    expect(result.current.cart).toHaveLength(0);
  });

  it('persists the cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(TEE));

    const saved = JSON.parse(localStorage.getItem('luxefashion_cart') || '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].productId).toBe('p1');
  });
});
