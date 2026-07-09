import CareerMentorChat from '../models/CareerMentorChat.js';
import { chatWithCareerMentor } from '../utils/geminiService.js';

// @desc    Send career message to mentor chatbot
// @route   POST /api/mentor/chat
// @access  Private
export const sendMessageToMentor = async (req, res) => {
  const { message, chatId } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide a message.' });
  }

  try {
    const userId = req.user._id;
    let chat;

    // 1. Fetch or initialize chat session
    if (chatId) {
      chat = await CareerMentorChat.findOne({ _id: chatId, user: userId });
      if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat thread not found.' });
      }
    } else {
      // Derive a dynamic title from the first few words of the user message
      const words = message.trim().split(/\s+/);
      const title = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');

      chat = await CareerMentorChat.create({
        user: userId,
        title: title || 'New Career Chat',
        messages: [],
      });
    }

    // 2. Push user message to history
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // 3. Request AI Mentor response (passing previous history)
    const mentorReply = await chatWithCareerMentor(chat.messages, message);

    // 4. Push mentor response to history
    chat.messages.push({
      role: 'mentor',
      content: mentorReply,
      timestamp: new Date(),
    });

    await chat.save();

    res.json({
      success: true,
      chat,
      mentorReply,
    });
  } catch (error) {
    console.error('Mentor chat failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's mentor chat sessions list (sidebar history)
// @route   GET /api/mentor/chats
// @access  Private
export const getChatsList = async (req, res) => {
  try {
    const chats = await CareerMentorChat.find({ user: req.user._id })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific chat messages history
// @route   GET /api/mentor/chats/:id
// @access  Private
export const getChatDetails = async (req, res) => {
  try {
    const chat = await CareerMentorChat.findOne({ _id: req.params.id, user: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found.' });
    }
    res.json({
      success: true,
      chat,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/mentor/chats/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await CareerMentorChat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found.' });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
