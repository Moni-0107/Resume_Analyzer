import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    questions: [
      {
        question: { type: String, required: true },
        type: {
          type: String,
          enum: ['HR', 'Technical', 'Coding', 'Scenario', 'Behavioral'],
          required: true,
        },
        sampleAnswer: { type: String, default: '' },
        explanation: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
