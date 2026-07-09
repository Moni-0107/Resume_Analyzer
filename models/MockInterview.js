import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: true,
      default: 'General Screen',
    },
    role: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Aptitude', 'Mixed'],
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, default: '' },
        type: { type: String, default: 'Technical' },
      },
    ],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    scores: {
      overall: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      fluency: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    recommendedResources: {
      type: [String],
      default: [],
    },
    suggestedPracticeQuestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);
export default MockInterview;
