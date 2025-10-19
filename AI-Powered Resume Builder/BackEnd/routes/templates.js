import express from 'express';
import Template from '../models/Template.js';

const router = express.Router();

// GET /api/templates - Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/templates/:id - Get one template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await Template.findOne({ id: req.params.id });
    if (template == null) {
      return res.status(404).json({ message: 'Cannot find template' });
    }
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;