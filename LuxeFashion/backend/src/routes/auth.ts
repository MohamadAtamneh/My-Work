import express from 'express';
import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '../controllers/authController';

const router = Router();

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', getCurrentUser);

export default router;
