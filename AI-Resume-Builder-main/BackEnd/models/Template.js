const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  imageUrl: { type: String }, 
  theme: {
    colors: {
      primary: String,
      secondary: String,
      accent: String,
    },
  },
  structure: {
    type: Object,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);