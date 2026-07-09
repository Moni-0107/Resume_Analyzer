import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    recommendedCertifications: {
      type: [String],
      default: [],
    },
    learningRoadmap: [
      {
        phase: { type: String, required: true }, // e.g., 'Phase 1: Fundamentals'
        topic: { type: String, required: true }, // e.g., 'React & State Management'
        resources: { type: [String], default: [] }, // links or course names
        duration: { type: String, default: '' }, // e.g., '2 weeks'
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
