import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'luxefashion_wishlist';

interface WishlistContextType {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Guests keep their wishlist in localStorage; on login it merges with the
// server-side list stored on the users/{uid} document.
const loadLocal = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, getIdToken } = useAuth();
  const [ids, setIds] = useState<string[]>(loadLocal);
  const mergedFor = useRef<string | null>(null);

  // Persist locally so guests keep their list across refreshes.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // storage unavailable (private mode) — wishlist still works in memory
    }
  }, [ids]);

  // Login: merge the local (guest) list with the server list — union wins so
  // nothing saved on either side is lost. Runs once per user.
  useEffect(() => {
    if (!user || mergedFor.current === user.uid) return;
    mergedFor.current = user.uid;
    let cancelled = false;

    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const res = await fetch('/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { productIds?: string[] };
        const serverIds = Array.isArray(data.productIds) ? data.productIds : [];
        if (!cancelled) {
          setIds((local) => Array.from(new Set([...local, ...serverIds])));
        }
      } catch {
        // offline — keep the local list
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Logged in: push every change to the server (debounced).
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        await fetch('/api/wishlist', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productIds: ids }),
        });
      } catch {
        // the next change will retry
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, user]);

  const has = (productId: string) => ids.includes(productId);

  const toggle = (productId: string) => {
    setIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
