// Firebase configuration & initialization (client-side web SDK)
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Values come from the frontend .env file (Vite exposes them via import.meta.env)
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize the Firebase app once (avoid double-init on HMR / SSR).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth + Firestore + Storage services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Analytics is only available in a browser environment. Initialize it
// lazily so SSR/Node test runners don't crash on import.
export const analytics = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null
);

export { app, firebaseConfig };
export default app;

