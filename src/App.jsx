import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeUpload from './pages/ResumeUpload';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ATSReportView from './pages/ATSReportView';
import SkillGap from './pages/SkillGap';
import MockInterview from './pages/MockInterview';
import LearningDashboard from './pages/LearningDashboard';
import AdminPanel from './pages/AdminPanel';
import JobMatch from './pages/JobMatch';
import PersonalizedRoadmap from './pages/PersonalizedRoadmap';
import CareerMentor from './pages/CareerMentor';
import MockInterviewArena from './pages/MockInterviewArena';
import InterviewAnalytics from './pages/InterviewAnalytics';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// 1. Protected Route Guard (Checks Login)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg-body text-primary-500">
        <span className="text-sm font-semibold animate-pulse">Initializing CV AI Platform...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 2. Admin Guard (Checks Admin clearance)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-darkBg-body text-primary-500">
        <span className="text-sm font-semibold animate-pulse">Verifying credentials...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 3. Layout wrapper for Dashboard screens
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-darkBg-body transition-colors">
      {/* Drawer Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden md:pl-64">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Workspace Layouts */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResumeUpload />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResumeAnalysis />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ats"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ATSReportView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-gap"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SkillGap />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MockInterview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LearningDashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-matcher"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <JobMatch />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PersonalizedRoadmap />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-mentor"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CareerMentor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-simulator"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MockInterviewArena />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <InterviewAnalytics />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin-only Guarded Route */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminPanel />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
