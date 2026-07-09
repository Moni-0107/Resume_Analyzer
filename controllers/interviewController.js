import Interview from '../models/Interview.js';
import InterviewResult from '../models/InterviewResult.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { generateInterviewQuestions, evaluateMockResponse, compileFinalInterviewReport } from '../utils/geminiService.js';

// @desc    Generate tailored interview questions based on resume & role
// @route   POST /api/interviews/generate
// @access  Private
export const generateQuestions = async (req, res) => {
  const targetRole = req.body.role || req.user.targetRole || 'Software Engineer';
  const experienceLevel = req.body.experienceLevel || req.user.experienceLevel || 'Entry';

  try {
    // Retrieve latest resume to feed details into Gemini
    const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    const resumeInfo = resume ? resume.extractedInfo : {
      name: req.user.name,
      skills: req.user.skills,
      experience: [],
      projects: [],
      education: []
    };

    // 1. Generate questions via AI
    const rawQuestions = await generateInterviewQuestions(resumeInfo, targetRole, experienceLevel);

    // 2. Save Interview session structure
    const interview = await Interview.create({
      user: req.user._id,
      role: targetRole,
      experienceLevel: experienceLevel,
      status: 'scheduled',
      questions: rawQuestions,
    });

    res.status(201).json({
      success: true,
      message: 'Interview questions generated successfully!',
      interview,
    });
  } catch (error) {
    console.error('Failed to generate interview questions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start mock interview chatbot session
// @route   POST /api/interviews/session/start
// @access  Private
export const startInterviewSession = async (req, res) => {
  const { interviewId } = req.body;

  try {
    const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    interview.status = 'in_progress';
    await interview.save();

    // Setup initial welcome message with the first question
    const firstQuestion = interview.questions[0].question;
    
    // Check if an InterviewResult already exists for this interview
    let result = await InterviewResult.findOne({ interview: interviewId });
    if (!result) {
      result = await InterviewResult.create({
        interview: interviewId,
        user: req.user._id,
        chatHistory: [
          {
            role: 'interviewer',
            content: `Hello! I am your AI Interviewer. I will guide you through a mock interview for the "${interview.role}" role. Let's begin. Question 1: ${firstQuestion}`,
            feedback: '',
            scores: { technical: 0, communication: 0, grammar: 0 },
          },
        ],
      });
    }

    res.json({
      success: true,
      interview,
      result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit answer, get feedback and trigger next question
// @route   POST /api/interviews/session/respond
// @access  Private
export const respondToQuestion = async (req, res) => {
  const { interviewId, candidateAnswer } = req.body;

  try {
    const interview = await Interview.findOne({ _id: interviewId, user: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const result = await InterviewResult.findOne({ interview: interviewId, user: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Interview result logs not found' });
    }

    // Determine current question index
    // Count how many 'candidate' messages are in the history
    const candidateResponses = result.chatHistory.filter(msg => msg.role === 'candidate');
    const currentIndex = candidateResponses.length;

    if (currentIndex >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'All interview questions have already been answered.' });
    }

    const currentQuestion = interview.questions[currentIndex];

    // 1. Evaluate the answer using Gemini
    const evaluation = await evaluateMockResponse(
      currentQuestion.question,
      candidateAnswer,
      result.chatHistory
    );

    // 2. Push candidate message to history
    result.chatHistory.push({
      role: 'candidate',
      content: candidateAnswer,
      feedback: evaluation.feedback,
      scores: evaluation.scores,
    });

    const nextIndex = currentIndex + 1;
    let isFinished = false;
    let nextQuestion = '';

    if (nextIndex < interview.questions.length) {
      // 3. Ask next question
      nextQuestion = interview.questions[nextIndex].question;
      result.chatHistory.push({
        role: 'interviewer',
        content: `Thanks for sharing. Here is the next question. Question ${nextIndex + 1}: ${nextQuestion}`,
        feedback: '',
        scores: { technical: 0, communication: 0, grammar: 0 },
      });
      await result.save();
    } else {
      // 4. Mark interview completed and compile final feedback reports
      isFinished = true;
      interview.status = 'completed';
      await interview.save();

      const finalReport = await compileFinalInterviewReport(result.chatHistory);
      result.scores = finalReport.scores;
      result.suggestions = finalReport.suggestions;
      result.finalReport = finalReport.finalReport;
      await result.save();
    }

    res.json({
      success: true,
      feedback: evaluation.feedback,
      scores: evaluation.scores,
      nextQuestion,
      isFinished,
      result: isFinished ? result : null,
    });
  } catch (error) {
    console.error('Error handling mock response:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get interview session logs history
// @route   GET /api/interviews/history
// @access  Private
export const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Map interviews with their matching result objects
    const history = await Promise.all(
      interviews.map(async (interview) => {
        const result = await InterviewResult.findOne({ interview: interview._id });
        return {
          _id: interview._id,
          role: interview.role,
          experienceLevel: interview.experienceLevel,
          status: interview.status,
          createdAt: interview.createdAt,
          result: result || null,
        };
      })
    );

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
