import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      default: 'Target Role',
    },
    jobDescriptionText: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    subScores: {
      skill: { type: Number, default: 0 },
      keyword: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      ats: { type: Number, default: 0 },
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    recommendedProjects: [
      {
        title: String,
        description: String,
        technologies: [String],
      },
    ],
    recommendedCertifications: {
      type: [String],
      default: [],
    },
    tailoredSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const JobMatch = mongoose.model('JobMatch', jobMatchSchema);
export default JobMatch;
