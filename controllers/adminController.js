import User from '../models/User.js';
import Resume from '../models/Resume.js';
import ATSReport from '../models/ATSReport.js';
import Interview from '../models/Interview.js';
import InterviewResult from '../models/InterviewResult.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Log from '../models/Log.js';

// Helper to record administrative logs
const createAdminLog = async (adminId, action, details) => {
  try {
    await Log.create({
      action,
      performedBy: adminId,
      details,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// @desc    Get dashboard metrics & stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResumes = await Resume.countDocuments({});
    const totalInterviews = await Interview.countDocuments({});
    
    // Average ATS scores
    const atsReports = await ATSReport.find({});
    const avgATS = atsReports.length > 0 
      ? Math.round(atsReports.reduce((sum, rep) => sum + rep.overallScore, 0) / atsReports.length)
      : 0;

    // Interview success averages
    const results = await InterviewResult.find({});
    const avgInterviewScore = results.length > 0
      ? Math.round(results.reduce((sum, res) => sum + (res.scores?.overall || 0), 0) / results.length)
      : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalResumes,
        totalInterviews,
        avgATS,
        avgInterviewScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user and all their associated records
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUserByAdmin = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }

    const userId = userToDelete._id;

    // Remove User's resumes and related analytics
    const userResumes = await Resume.find({ user: userId });
    for (const resume of userResumes) {
      // delete physical files if they exist
      try {
        if (fs.existsSync(resume.filePath)) {
          fs.unlinkSync(resume.filePath);
        }
      } catch (fErr) {
        console.error('File cleanup failed during user deletion:', fErr);
      }
      await ResumeAnalysis.deleteMany({ resume: resume._id });
      await ATSReport.deleteMany({ resume: resume._id });
    }
    await Resume.deleteMany({ user: userId });

    // Clean up interviews & results
    await InterviewResult.deleteMany({ user: userId });
    await Interview.deleteMany({ user: userId });

    // Delete user model
    await User.findByIdAndDelete(userId);

    // Audit log
    await createAdminLog(req.user._id, 'DELETE_USER', `Deleted user account: ${userToDelete.email} (${userToDelete.name})`);

    res.json({
      success: true,
      message: `User ${userToDelete.name} and all related database/file elements deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getSystemLogs = async (req, res) => {
  try {
    const logs = await Log.find({})
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mock prompt configs for system audit demonstration
let systemPrompts = {
  parserPrompt: 'Analyze raw resume text. Output structured JSON detailing user name, contact details, experiences, projects, skills, education, languages.',
  analysisPrompt: 'Compare resume structure against standard industry practices. Identify strengths, grammatical improvements, structural tips.',
  interviewerPrompt: 'Act as an expert technical recruiter. Conduct mock interview, evaluate criteria, ask tailormade questions.'
};

// @desc    Get AI configurations/prompts
// @route   GET /api/admin/prompts
// @access  Private/Admin
export const getAIPrompts = async (req, res) => {
  res.json({
    success: true,
    prompts: systemPrompts
  });
};

// @desc    Update AI prompts
// @route   PUT /api/admin/prompts
// @access  Private/Admin
export const updateAIPrompts = async (req, res) => {
  const { parserPrompt, analysisPrompt, interviewerPrompt } = req.body;

  try {
    if (parserPrompt) systemPrompts.parserPrompt = parserPrompt;
    if (analysisPrompt) systemPrompts.analysisPrompt = analysisPrompt;
    if (interviewerPrompt) systemPrompts.interviewerPrompt = interviewerPrompt;

    await createAdminLog(req.user._id, 'UPDATE_PROMPTS', 'Updated AI prompts configuration settings');

    res.json({
      success: true,
      message: 'AI Prompts settings updated successfully!',
      prompts: systemPrompts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
