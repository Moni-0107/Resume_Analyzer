import mongoose from 'mongoose';

const learningRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dailyTasks: [
      {
        id: { type: String, required: true },
        task: { type: String, required: true },
        hours: { type: Number, default: 1 },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        completed: { type: Boolean, default: false },
      },
    ],
    weeklyTasks: [
      {
        id: { type: String, required: true },
        week: { type: Number, required: true },
        topics: { type: [String], default: [] },
        milestone: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    completedMilestones: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const LearningRoadmap = mongoose.model('LearningRoadmap', learningRoadmapSchema);
export default LearningRoadmap;
