'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, DeviceSession } from '@/types';
import { apiFetch, getAuthToken, setAuthToken, removeAuthToken } from './api';

interface AuthContextType {
  user: User | null;
  session: DeviceSession | null;
  isLoading: boolean;
  login: (token: string, userData: User, sessionToken: string) => void;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  revocationNotice: string | null;
  dismissRevocationNotice: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revocationNotice, setRevocationNotice] = useState<string | null>(null);

  const refreshMe = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setSession(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setSession(res.data.session);
      }
    } catch (e: any) {
      console.warn('Authentication check failed:', e.message);
      removeAuthToken();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();

    // Listen for session revocation event from API client
    const handleRevoked = () => {
      setRevocationNotice('Your session was revoked because another device logged into your account or administrator reset it.');
      setUser(null);
      setSession(null);
      removeAuthToken();
    };

    window.addEventListener('session-revoked', handleRevoked);
    return () => window.removeEventListener('session-revoked', handleRevoked);
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
    refreshMe();
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      removeAuthToken();
      setUser(null);
      setSession(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const dismissRevocationNotice = () => setRevocationNotice(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        logout,
        refreshMe,
        revocationNotice,
        dismissRevocationNotice,
      }}
    >
      {revocationNotice && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 bg-red-950 border border-red-500 text-red-200 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 animate-bounce">
          <div>
            <h4 className="font-bold text-red-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              Session Revoked
            </h4>
            <p className="text-xs mt-1 text-red-300 leading-relaxed">{revocationNotice}</p>
          </div>
          <button
            onClick={dismissRevocationNotice}
            className="text-red-400 hover:text-white text-sm font-semibold px-2 py-1 bg-red-900/50 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
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
