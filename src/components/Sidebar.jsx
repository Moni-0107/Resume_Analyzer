import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  CheckSquare,
  GitCompare,
  MessageSquare,
  GraduationCap,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Bot,
  CalendarCheck,
  Briefcase
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/upload', icon: UploadCloud },
    { name: 'Resume Analysis', path: '/analysis', icon: FileSearch },
    { name: 'ATS Predictor', path: '/ats', icon: CheckSquare },
    { name: 'Job Matcher', path: '/job-matcher', icon: Briefcase },
    { name: 'Study Roadmap', path: '/roadmap', icon: CalendarCheck },
    { name: 'Career Mentor', path: '/career-mentor', icon: Bot },
    { name: 'Interview Simulator', path: '/interview-simulator', icon: Sparkles },
    { name: 'Analytics Panel', path: '/analytics', icon: TrendingUp },
    { name: 'Skill Gap Analysis', path: '/skill-gap', icon: GitCompare },
    { name: 'Mock Interview', path: '/mock-interview', icon: MessageSquare },
    { name: 'Learning Hub', path: '/learning', icon: GraduationCap },
  ];

  // Dynamically push admin tab
  if (user && user.role === 'admin') {
    menuItems.push({ name: 'Admin Control', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-darkBg-sidebar text-slate-800 dark:text-slate-200 transition-all duration-300 transform md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-wide text-primary-600 dark:text-primary-400">
          <span className="text-2xl">🚀</span>
          <span>CV AI Platform</span>
        </Link>
        <button onClick={toggleSidebar} className="md:hidden p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
          ✕
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => toggleSidebar(false)}
              className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                active
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 shadow-sm'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary-500' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Settings / Profile Tray */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/20">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="text-xs uppercase bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">
            {theme}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
