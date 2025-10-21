const express = require('express');
const authRoutes = require('./auth.js');
const resumeRoutes = require('./resumeData.js');
const templateRoutes = require('./templates.js');
const jobApplicationRoutes = require('./jobApplications.js');
const aiRoutes = require('./AI-Route.js');
const settingsRoutes = require('./settings.js');


const router = express.Router();

router.use('/users', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/templates', templateRoutes);
router.use('/jobs', jobApplicationRoutes);
router.use('/ai', aiRoutes);
router.use('/settings', settingsRoutes);


module.exports = router;
