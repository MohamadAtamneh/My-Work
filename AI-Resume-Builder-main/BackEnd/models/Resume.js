const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Resume',
  },
  templateId: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: 'default',
  },
  style: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  basics: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  blocks: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  // Storing the composed resume data for quick retrieval
  resumeData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
