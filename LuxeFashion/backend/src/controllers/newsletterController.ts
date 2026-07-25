import { Request, Response } from 'express';
import { db } from '../config/firebase';

const COLLECTION = 'newsletter';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Subscribe an email to the newsletter. Public endpoint — idempotent per email.
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    const normalized = (email || '').trim().toLowerCase();

    if (!EMAIL_RE.test(normalized)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existing = await db
      .collection(COLLECTION)
      .where('email', '==', normalized)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.json({ message: "You're already on the list.", alreadySubscribed: true });
    }

    await db.collection(COLLECTION).add({
      email: normalized,
      subscribedAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Thanks — you're on the list.", alreadySubscribed: false });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: error.message });
  }
};
