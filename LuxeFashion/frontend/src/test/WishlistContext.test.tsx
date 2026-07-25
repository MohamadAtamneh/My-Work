import { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Guest context: no signed-in user, no token — the wishlist stays local.
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, getIdToken: async () => null }),
}));

import { WishlistProvider, useWishlist } from '../contexts/WishlistContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <WishlistProvider>{children}</WishlistProvider>
);

describe('WishlistContext (guest)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles products on and off', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggle('p1'));
    expect(result.current.has('p1')).toBe(true);
    expect(result.current.count).toBe(1);

    act(() => result.current.toggle('p1'));
    expect(result.current.has('p1')).toBe(false);
    expect(result.current.count).toBe(0);
  });

  it('never duplicates ids', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggle('p1'));
    act(() => result.current.toggle('p2'));
    act(() => result.current.toggle('p1'));

    expect(result.current.ids).toEqual(['p2']);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggle('p1'));

    expect(JSON.parse(localStorage.getItem('luxefashion_wishlist') || '[]')).toEqual(['p1']);
  });
});
