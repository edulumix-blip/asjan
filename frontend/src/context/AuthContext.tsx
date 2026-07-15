'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../config/api';
import toast from 'react-hot-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  points: number;
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  rejectionReason?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (userData: any) => Promise<{ success: boolean; data?: any; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; message?: string; status?: string }>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<{ success: boolean; message?: string }>;
  isSuperAdmin: boolean;
  canPostJobs: boolean;
  canPostResources: boolean;
  canPostBlogs: boolean;
  canPostProducts: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('edulumix_token');
    const savedUser = localStorage.getItem('edulumix_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (_) {}
    }

    setLoading(false);

    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.success) {
            setUser(res.data.data);
            localStorage.setItem('edulumix_user', JSON.stringify(res.data.data));
          }
        })
        .catch(() => {
          localStorage.removeItem('edulumix_token');
          localStorage.removeItem('edulumix_user');
          setUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const signup = async (userData: any) => {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        toast.success(response.data.message || 'Signup request submitted!');
        return { success: true, data: response.data.data };
      }
      return { success: false, message: 'Signup failed' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Signup failed';
      const toastMessage = Array.isArray(message) ? message[0] : message;
      toast.error(toastMessage);
      return { success: false, message: toastMessage };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        localStorage.setItem('edulumix_token', token);
        localStorage.setItem('edulumix_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        return { success: true, data: userData };
      }
      return { success: false, message: 'Login failed' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      let status = error.response?.data?.status;
      
      if (message.toLowerCase().includes('pending')) {
        status = 'pending';
      }
      
      toast.error(message);
      return { success: false, message, status };
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('edulumix_token');
    localStorage.removeItem('edulumix_user');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData: any) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(response.data.data);
        localStorage.setItem('edulumix_user', JSON.stringify(response.data.data));
        toast.success('Profile updated successfully');
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, message };
    }
  };

  const role = user?.role || '';
  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    login,
    logout,
    updateProfile,
    isSuperAdmin: role === 'super_admin',
    canPostJobs: ['super_admin', 'job_poster'].includes(role),
    canPostResources: ['super_admin', 'resource_poster'].includes(role),
    canPostBlogs: ['super_admin', 'blog_poster', 'tech_blog_poster'].includes(role),
    canPostProducts: ['super_admin', 'digital_product_poster'].includes(role),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
