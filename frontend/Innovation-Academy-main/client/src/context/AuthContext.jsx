import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('trace_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('trace_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('trace_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('trace_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Failed to verify token on boot:', err.message);
          // Don't forcefully clear if token is valid mock/cached, unless 401
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('trace_token', res.token);
      localStorage.setItem('trace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('trace_token', res.token);
      localStorage.setItem('trace_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trace_token');
    localStorage.removeItem('trace_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('trace_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('Error refreshing user:', err.message);
    }
  };

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const openForgotModal = () => {
    setAuthModalMode('forgot');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    openLoginModal,
    openRegisterModal,
    openForgotModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

