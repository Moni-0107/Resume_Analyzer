import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import jobMatchRoutes from './routes/jobMatchRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import mockInterviewRoutes from './routes/mockInterviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import User from './models/User.js';

// Load environmental variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();

// Security Middlewares
// Customize helmet to allow PDF rendering and previews from local server if needed
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan logger for development output
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded items statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routers
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
// Keep both paths active for developer convenience
app.use('/api', aiRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/job-match', jobMatchRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/mock-interviews', mockInterviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.send('AI Resume Analyzer & Interview Prep Platform API is running...');
});

// Seed default users (Admin & Standard) on start if not already there
const seedDefaultAccounts = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@platform.com' });
    if (!adminExists) {
      await User.create({
        name: 'Administrator',
        email: 'admin@platform.com',
        password: 'AdminPass123!', // Automatically hashed by the pre-save hook
        role: 'admin',
        targetRole: 'CTO',
        experienceLevel: 'Senior',
        skills: ['Management', 'System Design', 'Recruiting'],
      });
      console.log('Seeded default admin account: admin@platform.com / AdminPass123!');
    }

    const userExists = await User.findOne({ email: 'user@platform.com' });
    if (!userExists) {
      await User.create({
        name: 'John Candidate',
        email: 'user@platform.com',
        password: 'UserPass123!', // Automatically hashed by the pre-save hook
        role: 'user',
        targetRole: 'Full Stack Developer',
        experienceLevel: 'Entry',
        skills: ['JavaScript', 'React.js', 'Node.js', 'HTML5', 'CSS3'],
      });
      console.log('Seeded default user account: user@platform.com / UserPass123!');
    }
  } catch (error) {
    console.error('Error pre-seeding credentials on startup:', error);
  }
};
seedDefaultAccounts();

// Global 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Global Error Handler:', err.message, err.stack);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
