import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/api/apiClient';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedLang = localStorage.getItem('language') || 'en';

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLanguage(storedLang);
    setLoading(false);
  }, []);

  const persistSession = (payload) => {
    const { user, accessToken } = payload;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    return { success: true, user };
  };

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      if (response.data.success) {
        return persistSession(response.data.data);
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const register = async (form) => {
    try {
      const response = await apiClient.post('/auth/register', form);
      if (response.data.success) {
        return persistSession(response.data.data);
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Sign up failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <AuthContext.Provider value={{ user, loading, language, login, register, logout, changeLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}
