import LearningRoadmap from '../models/LearningRoadmap.js';
import Resume from '../models/Resume.js';
import { getSkillGapReport } from './aiController.js'; // To find missing skills if needed
import { generatePersonalizedRoadmap } from '../utils/geminiService.js';
import Skill from '../models/Skill.js';

// @desc    Generate personalized learning roadmap
// @route   POST /api/roadmaps/generate
// @access  Private
export const buildRoadmap = async (req, res) => {
  const targetRole = req.body.targetRole || req.user.targetRole || 'Software Engineer';

  try {
    const userId = req.user._id;

    // 1. Get user's resume
    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    const resumeInfo = resume ? resume.extractedInfo : { name: req.user.name, skills: req.user.skills };

    // 2. Identify missing skills (Query skill collection baseline for the role)
    const roleSkills = await Skill.findOne({ roleName: { $regex: new RegExp(`^${targetRole}$`, 'i') } });
    const userSkills = req.user.skills || [];
    const missingSkills = roleSkills 
      ? roleSkills.requiredSkills.filter(reqSkill => !userSkills.some(skill => skill.toLowerCase() === reqSkill.toLowerCase()))
      : ['TypeScript', 'Testing', 'Docker', 'CI/CD'];

    // 3. Request Gemini to construct the roadmap tasks
    const pathData = await generatePersonalizedRoadmap(resumeInfo, missingSkills, targetRole);

    // 4. Create or overwrite the existing learning roadmap
    let roadmap = await LearningRoadmap.findOne({ user: userId, targetRole });

    if (roadmap) {
      roadmap.dailyTasks = pathData.dailyTasks.map(t => ({ ...t, completed: false }));
      roadmap.weeklyTasks = pathData.weeklyTasks.map(w => ({ ...w, completed: false }));
      roadmap.progress = 0;
      roadmap.completedMilestones = [];
      await roadmap.save();
    } else {
      roadmap = await LearningRoadmap.create({
        user: userId,
        targetRole,
        progress: 0,
        dailyTasks: pathData.dailyTasks,
        weeklyTasks: pathData.weeklyTasks,
        completedMilestones: [],
      });
    }

    res.status(201).json({
      success: true,
      message: 'Personalized roadmap created successfully!',
      roadmap,
    });
  } catch (error) {
    console.error('Failed to generate roadmap:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's current learning roadmap
// @route   GET /api/roadmaps/my-roadmap
// @access  Private
export const getMyRoadmap = async (req, res) => {
  try {
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No learning roadmap found. Please generate one.' });
    }

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle study task completion state
// @route   PUT /api/roadmaps/tasks/:id
// @access  Private
export const toggleTaskState = async (req, res) => {
  const taskId = req.params.id;
  const { completed } = req.body;

  try {
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Learning roadmap not found.' });
    }

    let taskFound = false;

    // Search in daily tasks
    const dailyTask = roadmap.dailyTasks.find(t => t.id === taskId);
    if (dailyTask) {
      dailyTask.completed = completed;
      taskFound = true;
    }

    // Search in weekly tasks
    const weeklyTask = roadmap.weeklyTasks.find(w => w.id === taskId);
    if (weeklyTask) {
      weeklyTask.completed = completed;
      taskFound = true;

      // Unlocked or lock milestone
      if (completed) {
        if (!roadmap.completedMilestones.includes(weeklyTask.milestone)) {
          roadmap.completedMilestones.push(weeklyTask.milestone);
        }
      } else {
        roadmap.completedMilestones = roadmap.completedMilestones.filter(m => m !== weeklyTask.milestone);
      }
    }

    if (!taskFound) {
      return res.status(404).json({ success: false, message: 'Task not found in active roadmap.' });
    }

    // Recalculate progress: completed tasks / total tasks
    const totalDaily = roadmap.dailyTasks.length;
    const totalWeekly = roadmap.weeklyTasks.length;
    const totalTasks = totalDaily + totalWeekly;

    const completedDaily = roadmap.dailyTasks.filter(t => t.completed).length;
    const completedWeekly = roadmap.weeklyTasks.filter(w => w.completed).length;
    const totalCompleted = completedDaily + completedWeekly;

    roadmap.progress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
    await roadmap.save();

    res.json({
      success: true,
      message: 'Task progress updated successfully!',
      roadmap,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
