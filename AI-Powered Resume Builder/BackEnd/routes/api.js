import express from 'express';
import authRoutes from './auth.js';
import resumeRoutes from './resumes.js';
import templateRoutes from './templates.js';
import jobApplicationRoutes from './jobApplications.js';
import aiRoutes from './AI-Route.js';
import settingsRoutes from './settings.js';


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/templates', templateRoutes);
router.use('/job-applications', jobApplicationRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);


export default router;
