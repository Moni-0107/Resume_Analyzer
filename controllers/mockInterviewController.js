import MockInterview from '../models/MockInterview.js';
import Resume from '../models/Resume.js';
import UserProgress from '../models/UserProgress.js';
import { generateInterviewQuestions, evaluateMockTurn, compileFinalMockReport } from '../utils/geminiService.js';

// Helper to log user study streaks and duration metrics
const logUserActivity = async (userId, minutes) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentWeek = today.substring(0, 7); // simple YYYY-MM week prefix match
    
    let progress = await UserProgress.findOne({ user: userId });
    if (!progress) {
      progress = await UserProgress.create({
        user: userId,
        streakCount: 1,
        lastActiveDate: today,
        weeklyActivityLogs: [{ week: currentWeek, minutes }],
      });
      return;
    }

    // Streaks calculations
    const lastActive = progress.lastActiveDate;
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActive === yesterdayStr) {
        progress.streakCount += 1;
      } else {
        progress.streakCount = 1;
      }
      progress.lastActiveDate = today;
    }

    // Activity minutes logging
    const weekLog = progress.weeklyActivityLogs.find(w => w.week === currentWeek);
    if (weekLog) {
      weekLog.minutes += minutes;
    } else {
      progress.weeklyActivityLogs.push({ week: currentWeek, minutes });
    }

    await progress.save();
  } catch (err) {
    console.error('Failed to log user progress metrics:', err);
  }
};

// @desc    Start Mock Interview session
// @route   POST /api/mock-interviews/start
// @access  Private
export const startMockSession = async (req, res) => {
  const { company, role, experienceLevel, interviewType } = req.body;

  if (!role || !experienceLevel || !interviewType) {
    return res.status(400).json({ success: false, message: 'Please provide role, level, and interview type.' });
  }

  try {
    const userId = req.user._id;

    // 1. Fetch latest resume details
    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    const resumeInfo = resume ? resume.extractedInfo : { name: req.user.name, skills: req.user.skills };

    // 2. Fetch questions tailored to parameters via Gemini (reusing existing schema with generic parameters)
    const rawQuestions = await generateInterviewQuestions(resumeInfo, `${company || 'General'} - ${role}`, experienceLevel);

    // 3. Format questions for new collection format
    const questionsList = rawQuestions.map(q => ({
      question: q.question,
      answer: '',
      type: q.type || 'Technical'
    }));

    // 4. Create interview session
    const interview = await MockInterview.create({
      user: userId,
      company: company || 'General Screen',
      role: role,
      experienceLevel: experienceLevel,
      interviewType: interviewType,
      status: 'in_progress',
      questions: questionsList,
      currentQuestionIndex: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Interview session initialized successfully!',
      interviewId: interview._id,
      firstQuestion: interview.questions[0].question,
      totalQuestions: interview.questions.length,
    });
  } catch (error) {
    console.error('Failed to start mock interview:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit answer to mock question, get feedback, trigger next question
// @route   POST /api/mock-interviews/respond
// @access  Private
export const respondToMockQuestion = async (req, res) => {
  const { interviewId, candidateAnswer } = req.body;

  if (!interviewId || candidateAnswer === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide interview ID and answer text.' });
  }

  try {
    const userId = req.user._id;
    const interview = await MockInterview.findOne({ _id: interviewId, user: userId });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock interview session not found.' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview session is already concluded.' });
    }

    const currentIndex = interview.currentQuestionIndex;
    const currentQuestionObj = interview.questions[currentIndex];
    
    // Save current response
    currentQuestionObj.answer = candidateAnswer;

    // 1. Evaluate candidate answer using Gemini (company/role context)
    const evaluation = await evaluateMockTurn(
      interview.company,
      interview.role,
      interview.interviewType,
      currentQuestionObj.question,
      candidateAnswer
    );

    // Temporarily cache evaluation result on the questions array for compiler reference
    currentQuestionObj.evaluation = {
      feedback: evaluation.feedback,
      scores: evaluation.scores
    };

    // Increment index
    const nextIndex = currentIndex + 1;
    interview.currentQuestionIndex = nextIndex;

    let isFinished = false;
    let nextQuestion = '';

    if (nextIndex < interview.questions.length) {
      nextQuestion = interview.questions[nextIndex].question;
      await interview.save();
    } else {
      // 2. Conclude interview and compile final performance report card
      isFinished = true;
      interview.status = 'completed';

      // Build history payload for compiler
      const transcript = interview.questions.map(q => ({
        role: 'candidate',
        content: q.answer,
        scores: q.evaluation?.scores
      }));

      const finalReport = await compileFinalMockReport(
        interview.company,
        interview.role,
        interview.interviewType,
        transcript
      );

      interview.scores = finalReport.scores;
      interview.areasForImprovement = finalReport.areasForImprovement;
      interview.recommendedResources = finalReport.recommendedResources;
      interview.suggestedPracticeQuestions = finalReport.suggestedPracticeQuestions;

      await interview.save();

      // Log 15 minutes of study practice and update daily streaks
      await logUserActivity(userId, 15);
    }

    res.json({
      success: true,
      feedback: evaluation.feedback,
      scores: evaluation.scores,
      nextQuestion,
      isFinished,
      interview: isFinished ? interview : null,
    });
  } catch (error) {
    console.error('Failed to submit answer response:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get mock interview history list
// @route   GET /api/mock-interviews/history
// @access  Private
export const getMockHistoryList = async (req, res) => {
  try {
    const history = await MockInterview.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
