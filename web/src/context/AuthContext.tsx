'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  matricNumber?: string;
  institution?: string;
  plan: 'free' | 'starter' | 'standard' | 'complete' | 'faculty';
  credits: number;
  status?: 'active' | 'flagged' | 'suspended';
  role?: 'student' | 'admin';
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  matricNumber?: string;
  institution?: string;
  course?: string;
}

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (role?: 'adebayo' | 'ibrahim' | 'chioma' | 'admin') => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (firebaseUser: { email: string; fullName: string; photoURL?: string; uid?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<SafeUser> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; resetToken?: string; resetUrl?: string; error?: string }>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  loginDemo: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
  updateProfile: async () => ({ success: false }),
  requestPasswordReset: async () => ({ success: false }),
  confirmPasswordReset: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Could not refresh session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    function handleCreditsEvent(e: any) {
      if (typeof e?.detail?.credits === 'number') {
        setUser(prev => (prev ? { ...prev, credits: e.detail.credits } : null));
      } else {
        refreshUser();
      }
    }

    window.addEventListener('credits-updated', handleCreditsEvent);
    return () => window.removeEventListener('credits-updated', handleCreditsEvent);
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Invalid credentials' };
      }
      setUser(data.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.user.credits } }));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Login request failed' };
    }
  };

  const loginDemo = async (role: 'adebayo' | 'ibrahim' | 'chioma' | 'admin' = 'adebayo') => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo: role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Demo login failed' };
      }
      setUser(data.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.user.credits } }));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Demo login request failed' };
    }
  };

  const loginWithGoogle = async (firebaseUser: { email: string; fullName: string; photoURL?: string; uid?: string }) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(firebaseUser),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Google authentication failed' };
      }
      setUser(data.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.user.credits } }));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Google authentication request failed' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setIsLoading(false);
        return { success: false, error: resData.error || 'Registration failed' };
      }
      setUser(resData.user);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: resData.user.credits } }));
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Registration request failed' };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.warn('Logout error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const updateProfile = async (updates: Partial<SafeUser> & { currentPassword?: string; newPassword?: string }) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Profile update failed' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to generate reset link' };
      }
      return {
        success: true,
        resetToken: data.token,
        resetUrl: data.resetUrl,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed' };
    }
  };

  const confirmPasswordReset = async (token: string, newPassword: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update password' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update request failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginDemo,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        updateProfile,
        requestPasswordReset,
        confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
