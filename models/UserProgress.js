import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String, // YYYY-MM-DD format
      default: '',
    },
    skillsImproved: [
      {
        skillName: String,
        originalScore: { type: Number, default: 0 },
        currentScore: { type: Number, default: 0 },
      },
    ],
    weeklyActivityLogs: [
      {
        week: String, // YYYY-WW format or date string
        minutes: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
