'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { DeviceSession } from '@/types';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  User as UserIcon, 
  Laptop, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Award, 
  Calendar,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [enrolledCount, setEnrolledCount] = useState<number>(1);

  useEffect(() => {
    apiFetch('/device-sessions')
      .then((res) => {
        if (res.success && res.data) setSessions(res.data);
      })
      .catch(() => {});

    apiFetch('/courses/enrolled')
      .then((res) => {
        if (res.success && res.data) setEnrolledCount(res.data.length);
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout
      role="student"
      title="Student Profile & Registration Details"
      subtitle="Official student academic records, registered contact details, and single-device security status"
    >
      <div className="space-y-8">
        {/* Welcome Card with Avatar and Basic Info */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-orange-50 border border-orange-200 rounded-md text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                  <span>Enrolled Academy Student</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user?.full_name}</h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Student Username: <strong className="text-slate-800">@{user?.username}</strong> &bull; ID #{user?.id}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Account Status: Active & Verified</span>
            </div>
          </div>

          {/* Basic Details Grid entered by Admin */}
          <div className="pt-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Basic Account Details (Admin Registered)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Full Name */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <UserIcon className="w-3.5 h-3.5 text-orange-600" />
                  <span>Student Name</span>
                </div>
                <div className="font-black text-sm text-slate-900">{user?.full_name || 'N/A'}</div>
              </div>

              {/* Email ID */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span>Registered Email</span>
                </div>
                <div className="font-semibold text-xs text-slate-900 truncate" title={user?.email}>
                  {user?.email || 'N/A'}
                </div>
              </div>

              {/* Mobile Number */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Phone className="w-3.5 h-3.5 text-orange-600" />
                  <span>Mobile Contact</span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {user?.phone || 'Registered in Academy Records'}
                </div>
              </div>

              {/* Course Enrollments */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <Layers className="w-3.5 h-3.5 text-orange-600" />
                  <span>Enrolled Programs</span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {enrolledCount} Active Masterclass
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Academic Assurance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hardware Device Session */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Single-Active-Device Hardware Binding</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your student login credentials are protected with hardware session token binding. When you log in from a new computer or browser, the previous session is automatically terminated to prevent account sharing.
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Current Authorized Browser Session
              </div>

              {sessions.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Current active browser session registered.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-orange-600" />
                        <span>{sess.device_name || 'Primary Computer'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">IP Address: {sess.ip_address}</div>
                      <div className="text-[10px] text-slate-400">
                        Session Active Since: {sess.last_active_at ? new Date(sess.last_active_at).toLocaleString() : 'Current Session'}
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full font-bold text-emerald-700 text-[10px]">
                      Active Now
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Academic Policy Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Award className="w-5 h-5 text-orange-600" />
                <span>Inymart ISO 9001:2015 Standards</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student profiles and assignment evaluations are governed under accredited Quality Management System standards. All password management and profile details are administered directly by the Academy Registrar.
              </p>
            </div>

            <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
                <Lock className="w-3.5 h-3.5 text-orange-600" />
                <span>Centralized Profile & Credential Management</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                To maintain credential integrity and strict progress tracking, personal contact details and login passwords are managed exclusively by Academy Administration. For updates, please contact your program advisor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
