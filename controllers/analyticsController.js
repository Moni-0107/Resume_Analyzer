import MockInterview from '../models/MockInterview.js';
import ATSReport from '../models/ATSReport.js';
import JobMatch from '../models/JobMatch.js';
import LearningRoadmap from '../models/LearningRoadmap.js';
import UserProgress from '../models/UserProgress.js';

// @desc    Get aggregated user analytics report for dashboard charts
// @route   GET /api/analytics/dashboard
// @access  Private
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch data in parallel
    const [mockInterviews, atsReports, jobMatches, roadmap, progress] = await Promise.all([
      MockInterview.find({ user: userId, status: 'completed' }),
      ATSReport.find({ user: userId }).sort({ createdAt: 1 }),
      JobMatch.find({ user: userId }).sort({ createdAt: 1 }),
      LearningRoadmap.findOne({ user: userId }),
      UserProgress.findOne({ user: userId })
    ]);

    // 2. Mock Interview Metrics
    const totalInterviews = mockInterviews.length;
    const scores = mockInterviews.map(i => i.scores?.overall || 0);
    const highestScore = totalInterviews > 0 ? Math.max(...scores) : 0;
    const lowestScore = totalInterviews > 0 ? Math.min(...scores) : 0;
    const averageScore = totalInterviews > 0 
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / totalInterviews) 
      : 0;

    // Calculate mock success rate (rating >= 70 counts as successful placement screen clearance)
    const successfulInterviews = mockInterviews.filter(i => (i.scores?.overall || 0) >= 70).length;
    const successRate = totalInterviews > 0 
      ? Math.round((successfulInterviews / totalInterviews) * 100) 
      : 0;

    // 3. Trends and Logs
    const atsScoreTrend = atsReports.map((r, idx) => ({
      name: `Ver ${idx + 1}`,
      score: r.overallScore,
    }));

    const jobMatchTrend = jobMatches.map((j, idx) => ({
      name: j.jobTitle.length > 10 ? j.jobTitle.substring(0, 10) + '...' : j.jobTitle,
      score: j.overallScore,
    }));

    const learningProgress = roadmap ? roadmap.progress : 0;
    const streakCount = progress ? progress.streakCount : 0;

    // 4. Skills categorizations
    const userSkills = req.user.skills || [];
    const strongSkills = userSkills.slice(0, 6);
    // Find missing skills dynamically
    const weakSkills = jobMatches.length > 0
      ? Array.from(new Set(jobMatches.flatMap(j => j.missingSkills))).slice(0, 6)
      : ['TypeScript', 'Jest', 'Docker', 'CI/CD', 'GraphQL', 'Webpack'];

    // 5. Activity logs (minutes/day study mock tracker)
    const activityLogs = progress?.weeklyActivityLogs?.length > 0
      ? progress.weeklyActivityLogs
      : [
          { week: 'Mon', minutes: 20 },
          { week: 'Tue', minutes: 30 },
          { week: 'Wed', minutes: 15 },
          { week: 'Thu', minutes: 40 },
          { week: 'Fri', minutes: 60 },
          { week: 'Sat', minutes: 10 },
          { week: 'Sun', minutes: 30 },
        ];

    res.json({
      success: true,
      analytics: {
        totalInterviews,
        averageScore,
        highestScore,
        lowestScore,
        successRate,
        streakCount,
        learningProgress,
        atsScoreTrend,
        jobMatchTrend,
        strongSkills,
        weakSkills,
        activityLogs,
      },
    });
  } catch (error) {
    console.error('Failed to compile analytics logs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
