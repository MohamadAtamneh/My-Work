import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  templateId: {
    type: String,
    required: true,
  },
  personalInfo: {
    name: String,
    title: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
  },
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String,
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: String,
    endDate: String,
  }],
  skills: [String],
  certifications: [{
    name: String,
    issuingOrganization: String,
    date: String,
  }],
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
