import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export type Role = 'admin' | 'customer';

interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

const toAuthUser = (u: FirebaseUser): AuthUser => ({
  uid: u.uid,
  email: u.email || '',
  displayName: u.displayName || '',
  photoURL: u.photoURL || undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track the Firebase client session and sync with the backend, which returns
    // the user's role (and upserts the users/{uid} Firestore document).
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(toAuthUser(fbUser));
        try {
          const idToken = await fbUser.getIdToken();
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            const data = await res.json();
            setRole(data.role === 'admin' ? 'admin' : 'customer');
          } else {
            setRole('customer');
          }
        } catch {
          setRole('customer');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Google sign-in — the backend /api/auth/login upsert is provider-agnostic,
  // so no server changes are needed for this.
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, {
        displayName,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
      });
      setUser(toAuthUser(cred.user));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  const getIdToken = async (): Promise<string | null> => {
    return auth.currentUser ? auth.currentUser.getIdToken() : null;
  };

  const value: AuthContextType = {
    user,
    role,
    isAdmin: role === 'admin',
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    logout,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;
