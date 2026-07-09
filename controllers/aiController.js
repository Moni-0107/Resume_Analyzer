import Resume from '../models/Resume.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import ATSReport from '../models/ATSReport.js';
import Skill from '../models/Skill.js';
import { analyzeResume, generateATSReport, analyzeSkillGap } from '../utils/geminiService.js';

// @desc    Get AI resume analysis
// @route   GET /api/analysis/:resumeId
// @access  Private
export const getResumeAnalysis = async (req, res) => {
  const { resumeId } = req.params;

  try {
    // 1. Check if analysis already exists
    let analysis = await ResumeAnalysis.findOne({ resume: resumeId, user: req.user._id });

    if (analysis) {
      return res.json({ success: true, analysis });
    }

    // 2. Fetch the Resume
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // 3. Trigger Gemini/Mock analysis
    const result = await analyzeResume(resume.extractedInfo);

    // 4. Save to Database
    analysis = await ResumeAnalysis.create({
      resume: resumeId,
      user: req.user._id,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      missingSkills: result.missingSkills,
      grammarSuggestions: result.grammarSuggestions,
      formattingSuggestions: result.formattingSuggestions,
      industryRecommendations: result.industryRecommendations,
      keywordSuggestions: result.keywordSuggestions,
      actionableTips: result.actionableTips,
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('AI Analysis failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get ATS score report
// @route   GET /api/ats/:resumeId
// @access  Private
export const getATSReportCard = async (req, res) => {
  const { resumeId } = req.params;
  const targetRole = req.user.targetRole || 'Software Engineer';

  try {
    // 1. Check if report already exists
    let report = await ATSReport.findOne({ resume: resumeId, user: req.user._id });

    if (report) {
      return res.json({ success: true, report });
    }

    // 2. Fetch Resume
    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // 3. Trigger Gemini/Mock scoring
    const result = await generateATSReport(resume.extractedInfo, targetRole);

    // 4. Save to Database
    report = await ATSReport.create({
      resume: resumeId,
      user: req.user._id,
      overallScore: result.overallScore,
      keywordScore: result.keywordScore,
      formattingScore: result.formattingScore,
      experienceScore: result.experienceScore,
      educationScore: result.educationScore,
      skillsScore: result.skillsScore,
      missingKeywords: result.missingKeywords,
      checklist: result.checklist,
    });

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('ATS Calculation failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get skill gap analysis against target role
// @route   GET /api/skills/gap-analysis
// @access  Private
export const getSkillGapReport = async (req, res) => {
  const targetRole = req.user.targetRole || 'Software Engineer';
  const userSkills = req.user.skills || [];

  try {
    // 1. Check if baseline skills exist in the skills database collection for this role.
    let roleSkills = await Skill.findOne({ roleName: { $regex: new RegExp(`^${targetRole}$`, 'i') } });

    // 2. If it does not exist, trigger Gemini to generate baseline skills & learning roadmap
    let gapData;
    if (!roleSkills) {
      gapData = await analyzeSkillGap(userSkills, targetRole);

      // Create skill baseline dynamically so subsequent inquiries load faster
      try {
        roleSkills = await Skill.create({
          roleName: targetRole,
          requiredSkills: [...gapData.matchingSkills, ...gapData.missingSkills],
          recommendedCertifications: gapData.recommendedCertifications,
          learningRoadmap: gapData.learningRoadmap,
        });
      } catch (dbErr) {
        console.error('Failed to pre-seed Skill collection dynamically:', dbErr);
      }
    } else {
      // If collection contains roleSkills, perform local comparisons
      const matchingSkills = userSkills.filter(skill => 
        roleSkills.requiredSkills.some(reqSkill => reqSkill.toLowerCase() === skill.toLowerCase())
      );
      const missingSkills = roleSkills.requiredSkills.filter(reqSkill => 
        !userSkills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase())
      );

      gapData = {
        matchingSkills,
        missingSkills,
        learningRoadmap: roleSkills.learningRoadmap,
        recommendedCertifications: roleSkills.recommendedCertifications,
        estimatedLearningTime: `${roleSkills.learningRoadmap.length * 2 || 6} weeks`,
      };
    }

    res.json({
      success: true,
      targetRole,
      analysis: gapData,
    });
  } catch (error) {
    console.error('Skill gap calculation failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
