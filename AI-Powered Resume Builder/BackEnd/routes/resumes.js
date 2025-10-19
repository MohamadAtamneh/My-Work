import express from 'express';
import Resume from '../models/Resume.js';

const router = express.Router();

// POST /api/resumes - Create new resume
router.post('/', async (req, res) => {
  const resume = new Resume({
    userId: req.body.userId,
    templateId: req.body.templateId,
    personalInfo: req.body.personalInfo,
    experience: req.body.experience,
    education: req.body.education,
    skills: req.body.skills,
    certifications: req.body.certifications,
  });

  try {
    const newResume = await resume.save();
    res.status(201).json(newResume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/resumes/user/:userId - Get all resumes for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.params.userId });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/resumes/:id - Get specific resume
router.get('/:id', getResume, (req, res) => {
  res.json(res.resume);
});

// PUT /api/resumes/:id - Update resume
router.put('/:id', getResume, async (req, res) => {
  if (req.body.userId != null) {
    res.resume.userId = req.body.userId;
  }
  if (req.body.templateId != null) {
    res.resume.templateId = req.body.templateId;
  }
  if (req.body.personalInfo != null) {
    res.resume.personalInfo = req.body.personalInfo;
  }
  if (req.body.experience != null) {
    res.resume.experience = req.body.experience;
  }
  if (req.body.education != null) {
    res.resume.education = req.body.education;
  }
  if (req.body.skills != null) {
    res.resume.skills = req.body.skills;
  }
  if (req.body.certifications != null) {
    res.resume.certifications = req.body.certifications;
  }

  try {
    const updatedResume = await res.resume.save();
    res.json(updatedResume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/resumes/:id - Delete resume
router.delete('/:id', getResume, async (req, res) => {
  try {
    await res.resume.remove();
    res.json({ message: 'Deleted Resume' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get resume by ID
async function getResume(req, res, next) {
  let resume;
  try {
    resume = await Resume.findById(req.params.id);
    if (resume == null) {
      return res.status(404).json({ message: 'Cannot find resume' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.resume = resume;
  next();
}

export default router;
