'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, ArrowLeft, GraduationCap, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Mode: 'student' (default) or 'admin'
  const [portalMode, setPortalMode] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          portal_type: portalMode, // 'student' or 'admin'
          device_name: deviceName.trim() || (typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'Browser'),
        }),
      });

      if (res.success && res.data) {
        // Enforce role isolation on frontend as well
        const role = res.data.user.role;
        if (portalMode === 'student' && role !== 'student') {
          setErrorMsg('This portal is exclusively for students. Please switch to the Admin Login tab.');
          setIsLoading(false);
          return;
        }

        if (portalMode === 'admin' && role === 'student') {
          setErrorMsg('Access Denied: Student accounts cannot access the Admin Console. Please use Student Login.');
          setIsLoading(false);
          return;
        }

        login(res.data.token, res.data.user, res.data.session_token);

        // Redirect strictly based on authenticated role
        if (role === 'student') {
          router.push('/student/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/40 to-slate-100 flex flex-col justify-center items-center p-4 py-12">
      {/* Back to Website link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inymart Website</span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          ISO 9001:2015 LMS
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <Logo href="/" />
          <div className="pt-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {portalMode === 'student' ? 'Student Learning Portal' : 'Admin Operations Console'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {portalMode === 'student'
                ? 'Sign in to access your assigned video lessons & assignments'
                : 'Restricted administrative and instructor access only'}
            </p>
          </div>
        </div>

        {/* 1st Reference Image: Two Buttons (Student Login, Admin Login) - Default: Student Login */}
        <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setPortalMode('student');
              setErrorMsg(null);
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'student'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('admin');
              setErrorMsg(null);
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'admin'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-orange-400" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              {portalMode === 'student' ? 'Student Username or Email' : 'Admin Username or Email'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={portalMode === 'student' ? 'e.g. student_alex' : 'e.g. superadmin'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
              portalMode === 'student'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to {portalMode === 'student' ? 'Student Portal' : 'Admin Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Policy Notice */}
        <div className="p-3 bg-orange-50 border border-orange-200/80 rounded-xl flex items-center gap-2.5 text-xs text-orange-900">
          <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="text-[11px] leading-tight font-medium">
            <strong>Single Active Device Policy:</strong> Logging in from this browser will immediately terminate any active session on other devices.
          </span>
        </div>
      </div>
    </div>
  );
}
