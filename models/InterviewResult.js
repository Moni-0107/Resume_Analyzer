import mongoose from 'mongoose';

const interviewResultSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatHistory: [
      {
        role: {
          type: String,
          enum: ['interviewer', 'candidate'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        feedback: {
          type: String,
          default: '',
        },
        scores: {
          technical: { type: Number, default: 0 },
          communication: { type: Number, default: 0 },
          grammar: { type: Number, default: 0 },
        },
      },
    ],
    scores: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      grammar: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    suggestions: {
      type: [String],
      default: [],
    },
    finalReport: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewResult = mongoose.model('InterviewResult', interviewResultSchema);
export default InterviewResult;
