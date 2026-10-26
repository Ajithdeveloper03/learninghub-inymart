'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Course, NotificationItem } from '@/types';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  BookOpen, 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Laptop, 
  ArrowRight,
  Sparkles,
  Award,
  Video,
  Lock
} from 'lucide-react';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, session, isLoading } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'student')) {
      router.push('/login');
      return;
    }

    if (user) {
      Promise.all([
        apiFetch('/courses/enrolled'),
        apiFetch('/notifications'),
      ])
        .then(([cRes, nRes]) => {
          if (cRes.success && cRes.data) setCourses(cRes.data);
          if (nRes.success && nRes.data) setNotifications(nRes.data.notifications || []);
        })
        .catch((err) => {
          console.warn('Dashboard fetch warning:', err);
        })
        .finally(() => setLoadingData(false));
    }
  }, [user, isLoading, router]);

  if (isLoading || loadingData) {
    return (
      <DashboardLayout role="student" title="Student Workspace">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="student"
      title="My Learning Desk"
      subtitle="Access your active course video lessons, implement practical assignments, and track instructor reviews"
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Inymart Masterclass Trainee</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Welcome back, {user?.full_name || user?.username}!
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Your video stream is securely watermarked and hardware-locked. Complete each module's practical assignment to unlock subsequent lessons.
            </p>
          </div>

          <div className="z-10 shrink-0">
            <Link
              href="/#contact"
              className="px-5 py-2.5 bg-white text-orange-700 hover:bg-orange-50 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <span>Academic Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Enrolled Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Enrolled Learning Programs</h3>
              <p className="text-xs text-slate-500">Pick up where you left off</p>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
              {courses.length} Active Enrollment(s)
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Active Enrollments</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your account is pending course assignment by the academy administrator. Please check back shortly or contact support.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => {
                const isCourseLocked = course.is_course_unlocked === false;

                return (
                  <div
                    key={course.id}
                    className={`rounded-3xl border shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all ${
                      isCourseLocked
                        ? 'bg-slate-50/80 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {isCourseLocked ? (
                          <span className="px-3 py-1 bg-slate-200 border border-slate-300 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-slate-500" />
                            Program Locked
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            {course.level || 'Masterclass'}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-orange-600" />
                          <span>Sequential Masterclass &bull; Admin Approval Gate</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900">{course.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">{course.description}</p>
                      </div>

                      {isCourseLocked && (
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-3">
                          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            Locked &bull; Complete the preceding program &apos;Digital Marketing Masterclass 2026&apos;, submit the task, and obtain Admin Approval to unlock this program.
                          </span>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Overall Course Progress</span>
                          <span className="text-orange-600">{course.progress_percentage || 0}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress_percentage || (isCourseLocked ? 0 : 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Real-Time Sequential Lessons & Admin Gate List */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Course Lessons & Gate Status
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Sequential Gate: Admin Approval Required
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {course.sections && course.sections.length > 0 ? (
                            course.sections.map((sec, sIdx) => {
                              const isUnlocked = !isCourseLocked && sec.is_unlocked;
                              const status = isCourseLocked ? 'LOCKED' : sec.workflow_status;

                              return (
                                <div
                                  key={sec.id}
                                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                    isUnlocked
                                      ? status === 'APPROVED'
                                        ? 'bg-emerald-50/70 border-emerald-200'
                                        : status === 'PENDING_REVIEW'
                                        ? 'bg-purple-50/70 border-purple-200'
                                        : 'bg-orange-50/50 border-orange-200 shadow-2xs'
                                      : 'bg-slate-50 border-slate-200 opacity-60'
                                  }`}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                        isUnlocked
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}>
                                        Lesson {sIdx + 1}
                                      </span>
                                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-md">
                                        {sec.title}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                                      <span className="text-slate-500 flex items-center gap-1">
                                        <Video className="w-3 h-3 text-orange-600" />
                                        {sec.duration_seconds || 180}s video lesson
                                      </span>
                                      <span className="text-slate-300">&bull;</span>
                                      <span>
                                        {status === 'APPROVED' ? (
                                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            Completed & Approved by Admin
                                          </span>
                                        ) : status === 'PENDING_REVIEW' ? (
                                          <span className="text-purple-700 font-bold flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                                            Task Submitted &bull; Awaiting Admin Approval to open Lesson {sIdx + 2}
                                          </span>
                                        ) : isUnlocked ? (
                                          <span className="text-orange-700 font-semibold">
                                            ▶ Active &bull; Watch Video & Submit Task
                                          </span>
                                        ) : (
                                          <span className="text-slate-400 font-medium flex items-center gap-1">
                                            <Lock className="w-3 h-3 text-slate-400" />
                                            {isCourseLocked
                                              ? 'Locked • Opens once previous course task is Approved by Admin'
                                              : 'Locked • Opens once previous lesson task is Approved by Admin'}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    {isUnlocked ? (
                                      <Link
                                        href={`/student/courses/${course.id}?section=${sec.id}`}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                                          status === 'APPROVED'
                                            ? 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                                            : status === 'PENDING_REVIEW'
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                                        }`}
                                      >
                                        <PlayCircle className="w-3.5 h-3.5" />
                                        <span>
                                          {status === 'APPROVED'
                                            ? 'Review Lesson'
                                            : status === 'PENDING_REVIEW'
                                            ? 'View Submitted Task'
                                            : 'Open Video Lesson'}
                                        </span>
                                      </Link>
                                    ) : (
                                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-200/70 text-slate-400 text-xs font-bold cursor-not-allowed select-none">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Locked</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs text-slate-400">Loading lessons...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications & Announcements Feed */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-600" />
              <span>Recent Instructor Feedback & System Alerts</span>
            </h3>
            <Link href="/student/notifications" className="text-xs font-bold text-orange-600 hover:underline">
              View all &rarr;
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No new alerts. When instructors review your assignments, notifications appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="py-3 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-800">{n.title}</div>
                    <div className="text-slate-500 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
