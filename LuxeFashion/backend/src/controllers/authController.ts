import { Request, Response } from 'express';
import { auth, db } from '../config/firebase';

export interface UserPayload {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface LoginRequest {
  idToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

const USERS_COLLECTION = 'users';

// Comma-separated list of admin emails (backend .env). These users are granted
// the 'admin' role automatically whenever they authenticate.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type Role = 'admin' | 'customer';

// Admins are resolved from ADMIN_EMAILS; everyone else keeps their existing role
// (so we never downgrade an admin) or defaults to 'customer'.
const resolveRole = async (docRef: FirebaseFirestore.DocumentReference, email: string): Promise<Role> => {
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
  const snap = await docRef.get();
  const existing = snap.exists ? (snap.data() as { role?: Role } | undefined)?.role : undefined;
  return existing === 'admin' ? 'admin' : 'customer';
};

const upsertUserDoc = async (uid: string, email: string, displayName?: string, photoURL?: string): Promise<Role> => {
  const docRef = db.collection(USERS_COLLECTION).doc(uid);
  const now = new Date().toISOString();
  const role = await resolveRole(docRef, email);
  await docRef.set(
    {
      uid,
      email,
      displayName: displayName || null,
      photoURL: photoURL || null,
      role,
      updatedAt: now
    },
    { merge: true }
  );
  return role;
};

// Register user (creates the Firebase Auth user; the frontend signs in and sends an idToken)
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body as RegisterRequest;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      photoURL
    });

    const role = await upsertUserDoc(userRecord.uid, email, displayName, photoURL);

    res.status(201).json({
      uid: userRecord.uid,
      email,
      displayName,
      photoURL,
      role
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    const status = error?.errorInfo?.code === 'auth/email-already-exists' ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
};

// Login user — verifies the Firebase ID token sent from the frontend client SDK
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body as LoginRequest;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const decoded = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decoded.uid);

    const role = await upsertUserDoc(userRecord.uid, userRecord.email || '', userRecord.displayName || undefined, userRecord.photoURL || undefined);

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      role
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Logout user (client-side only with Firebase client SDK)
export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user from ID token
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const idToken = extractToken(req);
    if (!idToken) return res.status(401).json({ error: 'No token provided' });

    const decoded = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decoded.uid);

    const role = await upsertUserDoc(userRecord.uid, userRecord.email || '', userRecord.displayName || undefined, userRecord.photoURL || undefined);

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      role
    });
  } catch (error: any) {
    console.error('Error getting current user:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.body?.idToken) return req.body.idToken;
  return null;
};
