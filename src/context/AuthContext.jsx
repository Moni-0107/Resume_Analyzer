import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Setup auth headers whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  // Load user profile on app load if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/api/auth/profile');
          if (data.success) {
            const userProfile = {
              _id: data._id,
              name: data.name,
              email: data.email,
              role: data.role,
              targetRole: data.targetRole,
              experienceLevel: data.experienceLevel,
              skills: data.skills,
              profilePicture: data.profilePicture || '',
            };
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error('Failed to load user profile on startup:', error);
          // Token is likely invalid or expired
          setToken('');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  // Register action
  const register = async (name, email, password, targetRole, experienceLevel) => {
    try {
      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        targetRole,
        experienceLevel,
      });

      if (data.success) {
        setToken(data.token);
        const userProfile = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
          skills: data.skills,
          profilePicture: data.profilePicture || '',
        };
        setUser(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Try again.',
      };
    }
  };

  // Login action
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });

      if (data.success) {
        setToken(data.token);
        const userProfile = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          targetRole: data.targetRole,
          experienceLevel: data.experienceLevel,
          skills: data.skills,
          profilePicture: data.profilePicture || '',
        };
        setUser(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials',
      };
    }
  };

  // Logout action
  const logout = () => {
    setToken('');
    setUser(null);
  };

  // Update profile in state
  const syncProfile = (updatedProfile) => {
    setUser(updatedProfile);
    localStorage.setItem('user', JSON.stringify(updatedProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
