import Resume from '../models/Resume.js';
import User from '../models/User.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import ATSReport from '../models/ATSReport.js';
import { parsePDF } from '../utils/pdfParser.js';
import { parseResumeText } from '../utils/geminiService.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload and parse resume (PDF)
// @route   POST /api/resumes/upload
// @access  Private
export const uploadAndParseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file' });
    }

    const userId = req.user._id;

    // Check if user already has an uploaded resume. Delete it first if they do.
    const existingResume = await Resume.findOne({ user: userId });
    if (existingResume) {
      // Delete old file from physical storage
      if (fs.existsSync(existingResume.filePath)) {
        try {
          fs.unlinkSync(existingResume.filePath);
        } catch (err) {
          console.error('Error deleting old resume file:', err);
        }
      }
      // Delete associated data
      await ResumeAnalysis.deleteOne({ resume: existingResume._id });
      await ATSReport.deleteOne({ resume: existingResume._id });
      await Resume.deleteOne({ _id: existingResume._id });
    }

    const filePath = req.file.path.replace(/\\/g, '/');

    // 1. Parse PDF text
    const parsedText = await parsePDF(filePath);

    // 2. Extract structured details via Gemini/Mock service
    const extractedInfo = await parseResumeText(parsedText);

    // 3. Create Resume document in Database
    const newResume = await Resume.create({
      user: userId,
      originalName: req.file.originalname,
      filePath: filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      parsedText: parsedText,
      extractedInfo: extractedInfo,
    });

    // 4. Proactively sync user profile skills with the extracted skills
    const user = await User.findById(userId);
    if (user && extractedInfo && extractedInfo.skills && extractedInfo.skills.length > 0) {
      // Merge unique skills
      const updatedSkills = Array.from(new Set([...user.skills, ...extractedInfo.skills]));
      user.skills = updatedSkills;
      // If name is blank or default, populate with parsed name
      if (extractedInfo.name && (!user.name || user.name.toLowerCase() === 'name')) {
        user.name = extractedInfo.name;
      }
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully!',
      resume: newResume,
    });
  } catch (error) {
    console.error('Resume upload/parsing failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's latest resume
// @route   GET /api/resumes/my-resume
// @access  Private
export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found for this user.' });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resume and related analytics
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Delete the file from filesystem
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (err) {
        console.error('Error deleting physical resume file:', err);
      }
    }

    // Delete associated analysis and reports
    await ResumeAnalysis.deleteOne({ resume: resume._id });
    await ATSReport.deleteOne({ resume: resume._id });

    // Delete the resume model
    await Resume.deleteOne({ _id: resume._id });

    res.json({
      success: true,
      message: 'Resume and all related analysis records deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Preview PDF resume file
// @route   GET /api/resumes/:id/preview
// @access  Private
export const previewResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found or unauthorized' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ success: false, message: 'Physical resume file does not exist on disk' });
    }

    // Set appropriate headers and stream
    res.contentType('application/pdf');
    const stream = fs.createReadStream(resume.filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
