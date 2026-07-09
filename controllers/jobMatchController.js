import JobMatch from '../models/JobMatch.js';
import Resume from '../models/Resume.js';
import { parsePDF } from '../utils/pdfParser.js';
import { analyzeJobMatch } from '../utils/geminiService.js';
import fs from 'fs';

// @desc    Analyze JD match score
// @route   POST /api/job-match/analyze
// @access  Private
export const runJobMatchAnalysis = async (req, res) => {
  const { jobTitle } = req.body;
  let jdText = req.body.jobDescriptionText || '';

  try {
    const userId = req.user._id;

    // 1. If PDF file upload present, parse it
    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, '/');
      try {
        jdText = await parsePDF(filePath);
      } catch (parseErr) {
        return res.status(400).json({ success: false, message: 'Failed to parse Job Description PDF.' });
      } finally {
        // Clean up temporary JD PDF upload
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    if (!jdText.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide job description text or upload a PDF.' });
    }

    // 2. Fetch latest Resume
    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ success: false, message: 'Please upload your resume first before running job matches.' });
    }

    // 3. Analyze match via Gemini
    const result = await analyzeJobMatch(resume.extractedInfo, jdText);

    // 4. Save to Database
    const jobMatch = await JobMatch.create({
      user: userId,
      resume: resume._id,
      jobTitle: jobTitle || 'Target Role',
      jobDescriptionText: jdText,
      overallScore: result.overallScore,
      subScores: result.subScores,
      missingKeywords: result.missingKeywords,
      missingSkills: result.missingSkills,
      suggestions: result.suggestions,
      recommendedProjects: result.recommendedProjects,
      recommendedCertifications: result.recommendedCertifications,
      tailoredSummary: result.tailoredSummary,
    });

    res.status(201).json({
      success: true,
      message: 'Job description matching completed!',
      jobMatch,
    });
  } catch (error) {
    console.error('Job match analysis failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get job matches history
// @route   GET /api/job-match/history
// @access  Private
export const getJobMatchHistory = async (req, res) => {
  try {
    const history = await JobMatch.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get specific job match details
// @route   GET /api/job-match/:id
// @access  Private
export const getJobMatchDetails = async (req, res) => {
  try {
    const jobMatch = await JobMatch.findOne({ _id: req.params.id, user: req.user._id });
    if (!jobMatch) {
      return res.status(404).json({ success: false, message: 'Job match report not found.' });
    }
    res.json({
      success: true,
      jobMatch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
