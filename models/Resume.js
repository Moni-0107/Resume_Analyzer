import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    parsedText: {
      type: String,
      default: '',
    },
    extractedInfo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      education: [
        {
          institution: String,
          degree: String,
          fieldOfStudy: String,
          startDate: String,
          endDate: String,
        },
      ],
      skills: { type: [String], default: [] },
      experience: [
        {
          company: String,
          position: String,
          startDate: String,
          endDate: String,
          description: String,
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          technologies: [String],
        },
      ],
      certifications: { type: [String], default: [] },
      languages: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
