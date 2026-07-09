import mongoose from 'mongoose';

const careerMentorChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Conversation',
    },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'mentor'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CareerMentorChat = mongoose.model('CareerMentorChat', careerMentorChatSchema);
export default CareerMentorChat;
