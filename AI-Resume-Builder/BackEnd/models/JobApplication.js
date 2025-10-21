// models/JobApplication.js
const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: ''
    },
    jobLink: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'],
      default: 'Applied'
    },
    dateApplied: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    salary: {
      type: String,
      default: ''
    } ,
    archived: {
    type: Boolean,
    default: false
  },
  // Add these for better stats:
  interviewDate: {
    type: Date,
    default: null
  },
  offerDate: {
    type: Date,
    default: null
  }
}, 
  {
    timestamps: true
  }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);