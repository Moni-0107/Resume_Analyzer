import mongoose from 'mongoose';

const atsReportSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    keywordScore: {
      type: Number,
      default: 0,
    },
    formattingScore: {
      type: Number,
      default: 0,
    },
    experienceScore: {
      type: Number,
      default: 0,
    },
    educationScore: {
      type: Number,
      default: 0,
    },
    skillsScore: {
      type: Number,
      default: 0,
    },
    missingKeywords: {
      type: [String],
      default: [],
    },
    checklist: [
      {
        task: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ATSReport = mongoose.model('ATSReport', atsReportSchema);
export default ATSReport;
