import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, Search, User, ChevronDown } from 'lucide-react';
import axios from 'axios';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch notifications for the user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const { data } = await axios.get('/api/auth/profile'); // Mock fetch or general settings
          // Seed standard mock notifications if API is empty
          setNotifications([
            { id: 1, title: 'Welcome!', message: 'Upload your PDF resume to check your ATS rating.', time: '1 hour ago', read: false },
            { id: 2, title: 'Interview Complete', message: 'Your mock interview results are compiled.', time: '2 days ago', read: true }
          ]);
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-darkBg-sidebar/80 backdrop-blur-md">
      {/* Left side: Hamburger and page info */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4.5 h-4.5 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search resumes, jobs, tools..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Right side: Notifications, Profile Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowDropdown(false);
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full glow-primary"></span>
            )}
          </button>

          {/* Notifications Panel Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm">Notifications</span>
                <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        !n.read ? 'bg-primary-50/20 dark:bg-primary-950/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-xs text-slate-800 dark:text-slate-200">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {user.profilePicture ? (
                <img
                  src={`/${user.profilePicture}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500 text-white text-xs font-bold font-sans">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left pr-1">
                <span className="text-xs font-semibold leading-none text-slate-800 dark:text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{user.targetRole}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </button>

            {/* Profile Dropdown Panel */}
            {showDropdown && (
              <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg py-1.5 z-50">
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4.5 h-4.5 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <Link
                  to="/profile"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-xs text-slate-400 uppercase tracking-wider"
                >
                  Target: {user.experienceLevel} Level
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
