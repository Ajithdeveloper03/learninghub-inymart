'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardStats } from '@/types';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Laptop, 
  FileText,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalSub, setReviewModalSub] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  const fetchStats = () => {
    apiFetch('/reports/dashboard')
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || !['super_admin', 'admin'].includes(user.role))) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchStats();
    }
  }, [user, isLoading, router]);

  const handleReviewDecision = async (decision: 'APPROVE' | 'REVISION' | 'REJECT') => {
    if (!reviewModalSub) return;
    setReviewActionLoading(true);

    try {
      let endpoint = `/submissions/${reviewModalSub.id}/approve`;
      let body: any = { remarks: feedbackText };

      if (decision === 'REVISION') {
        endpoint = `/submissions/${reviewModalSub.id}/request-revision`;
      } else if (decision === 'REJECT') {
        endpoint = `/submissions/${reviewModalSub.id}/reject`;
      }

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.success) {
        setReviewModalSub(null);
        setFeedbackText('');
        fetchStats();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setReviewActionLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout role="admin" title="Admin Overview">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="admin" 
      title="Administrator Operations Console" 
      subtitle="Real-time oversight of student submissions, course unlocks, device sessions, and security"
    >
      <div className="space-y-8">
        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700">LMS Engine Running Smoothly</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/approvals"
              className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Pending Approvals ({stats?.pending_approvals || 0})</span>
            </Link>

            <Link
              href="/admin/students"
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>Manage Students</span>
            </Link>

            <Link
              href="/admin/reports"
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Audit Reports</span>
            </Link>
          </div>
        </div>

        {/* KPI Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Total Students</span>
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats?.total_students || 0}</div>
            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span>&bull;</span>
              <span>{stats?.active_students || 0} Active Student Accounts</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Pending Reviews</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">{stats?.pending_approvals || 0}</div>
            <div className="text-xs text-slate-500">
              Awaiting instructor review to unlock next section
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Published Courses</span>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats?.published_courses || 0}</div>
            <div className="text-xs text-slate-500">{stats?.total_courses || 0} Total Active Curriculums</div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>24h Active Learners</span>
              <Laptop className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{stats?.students_active_24h || 0}</div>
            <div className="text-xs text-slate-500">
              {stats?.completed_sections || 0} Sections Fully Approved
            </div>
          </div>
        </div>

        {/* Main Grid: Pending Submissions Queue + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Submissions Table */}
          <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-600" />
                  <span>Recent Student Submissions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Click review to evaluate and unlock the next section</p>
              </div>
              <Link href="/admin/approvals" className="text-xs font-bold text-orange-600 hover:underline">
                View all ({stats?.pending_approvals}) &rarr;
              </Link>
            </div>

            {!stats?.recent_submissions || stats.recent_submissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">No recent submissions found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recent_submissions.map((sub: any) => (
                  <div key={sub.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {sub.student_name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">@{sub.student_username}</span>
                        <StatusBadge status={sub.status} />
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        {sub.course_title} &bull; <strong className="text-slate-800">{sub.section_title}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReviewModalSub(sub);
                        setFeedbackText(sub.instructor_feedback || '');
                      }}
                      className="shrink-0 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-2xs"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts & Academy Security */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Management Shortcuts
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/students"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span>Create Individual Student Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin/courses"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Manage Course Curriculum & Videos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin/reports"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>Download CSV Audit Logs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-orange-50/60 border border-orange-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-800">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Security Assurance</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                All video streams are tokenized with 300s TTL and watermarked with student identity. Anti-skip requires &ge;95% segment coverage before section tasks unlock.
              </p>
            </div>
          </div>
        </div>

        {/* REVIEW SUBMISSION MODAL */}
        {reviewModalSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">Review Student Task</h3>
                  <div className="text-xs text-slate-500">
                    {reviewModalSub.student_name} (@{reviewModalSub.student_username})
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalSub(null)}
                  className="text-slate-400 hover:text-slate-800 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Submission details */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold uppercase text-slate-500 block mb-1">
                    Lesson & Assignment
                  </label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-semibold">
                    {reviewModalSub.section_title}
                  </div>
                </div>

                {reviewModalSub.submission_text && (
                  <div>
                    <label className="font-bold uppercase text-slate-500 block mb-1">
                      Student's Submission Notes
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono whitespace-pre-wrap">
                      {reviewModalSub.submission_text}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold uppercase text-slate-700 block mb-1">
                    Instructor Remarks & Feedback (Required for revisions)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter actionable remarks or constructive corrections for the student..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  disabled={reviewActionLoading}
                  onClick={() => handleReviewDecision('REVISION')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Request Revision
                </button>

                <button
                  disabled={reviewActionLoading}
                  onClick={() => handleReviewDecision('REJECT')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Reject
                </button>

                <button
                  disabled={reviewActionLoading}
                  onClick={() => handleReviewDecision('APPROVE')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Approve & Unlock Next Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
