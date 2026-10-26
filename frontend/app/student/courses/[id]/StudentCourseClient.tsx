'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Course, Section } from '@/types';
import { apiFetch } from '@/lib/api';
import { CustomVideoPlayer } from '@/components/CustomVideoPlayer';
import { AssignmentCard } from '@/components/AssignmentCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Logo } from '@/components/Logo';
import { 
  BookOpen, 
  ChevronLeft, 
  Video, 
  Lock, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function StudentCourseClient({ initialId }: { initialId: string }) {
  const [courseId, setCourseId] = useState(initialId);

  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [isVideoCompleted, setIsVideoCompleted] = useState<boolean>(false);
  const [sessionCompletedIds, setSessionCompletedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback to URL path in case of static export rewrite
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/student\/courses\/([^\/]+)/);
      if (match && match[1] && match[1] !== courseId) {
        setCourseId(match[1]);
      }
    }
  }, [courseId]);

  // Helper to determine if a section's video is considered complete
  const isSectionVideoCompleted = useCallback((sec: Section | null, sessionSet: Set<number>): boolean => {
    if (!sec) return false;
    if (sessionSet.has(sec.id)) return true;

    // Check if video progress is complete in DB
    if (sec.progress && sec.progress.status === 'VIDEO_COMPLETED') {
      if (sec.submission?.status === 'REJECTED' && sec.submission?.reviewed_at) {
        if (!sec.progress.completed_at) return false;
        const revTime = new Date(sec.submission.reviewed_at).getTime();
        const compTime = new Date(sec.progress.completed_at).getTime();
        // If completed after rejection, it counts as successfully re-watched!
        if (compTime > revTime) return true;
        return false;
      }
      return true;
    }

    if (sec.workflow_status === 'VIDEO_COMPLETED') return true;
    if (['PENDING_REVIEW', 'APPROVED', 'REVISION_REQUIRED'].includes(sec.workflow_status || '')) return true;

    return false;
  }, []);

  // Fetch course hierarchy with current student's status
  const loadCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await apiFetch(`/courses/${courseId}`);
      if (res.success && res.data) {
        setCourse(res.data);

        // Find all sections flattened
        const allSections: Section[] = [];
        res.data.modules?.forEach((m: any) => {
          m.sections?.forEach((s: any) => allSections.push(s));
        });

        // Set active section: either current activeSection or first unlocked/available section
        setActiveSection((prev) => {
          const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const querySecId = urlParams ? Number(urlParams.get('section')) : null;
          if (querySecId) {
            const requested = allSections.find((s) => s.id === querySecId && s.is_unlocked);
            if (requested) {
              const comp = isSectionVideoCompleted(requested, sessionCompletedIds);
              setIsVideoCompleted(comp);
              return requested;
            }
          }

          if (prev) {
            const updated = allSections.find((s) => s.id === prev.id);
            if (updated) {
              const comp = isSectionVideoCompleted(updated, sessionCompletedIds);
              setIsVideoCompleted(comp);
              return updated;
            }
          }

          const target = allSections.find((s) => s.is_unlocked && s.workflow_status !== 'APPROVED') || allSections.find((s) => s.is_unlocked);
          if (target) {
            const comp = isSectionVideoCompleted(target, sessionCompletedIds);
            setIsVideoCompleted(comp);
          }
          return target || null;
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load course modules');
    } finally {
      setLoading(false);
    }
  }, [courseId, isSectionVideoCompleted, sessionCompletedIds]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadCourseData();
    }
  }, [user, isLoading, loadCourseData, router]);

  const handleVideoCompleted = () => {
    if (activeSection) {
      setSessionCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(activeSection.id);
        return next;
      });
    }
    setIsVideoCompleted(true);
    loadCourseData();

    // AUTOMATICALLY SCROLL DOWN & OPEN/HIGHLIGHT TASK SECTION
    setTimeout(() => {
      const taskSection = document.getElementById('task-assignment-section');
      if (taskSection) {
        taskSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        taskSection.classList.add('ring-4', 'ring-emerald-500', 'shadow-2xl', 'transition-all', 'duration-500');
        setTimeout(() => {
          taskSection.classList.remove('ring-4', 'ring-emerald-500', 'shadow-2xl');
        }, 3000);
      }
    }, 300);
  };

  const selectSection = (sec: Section) => {
    if (!sec.is_unlocked) return;
    setActiveSection(sec);
    const comp = isSectionVideoCompleted(sec, sessionCompletedIds);
    setIsVideoCompleted(comp);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="font-semibold text-xs">Loading course syllabus...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
        <Link
          href="/student/dashboard"
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
        >
          Return to Learning Desk
        </Link>
      </div>
    );
  }

  // Find sections in flow
  const allSectionsList: Section[] = [];
  course?.modules?.forEach((m) => m.sections?.forEach((s) => allSectionsList.push(s)));
  const currentIndex = allSectionsList.findIndex((s) => s.id === activeSection?.id);
  const prevSection = currentIndex > 0 ? allSectionsList[currentIndex - 1] : null;
  const nextSection = currentIndex !== -1 && currentIndex + 1 < allSectionsList.length ? allSectionsList[currentIndex + 1] : null;

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col font-sans select-none print:hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Workspace Top Header Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Learning Desk</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
            {course?.title}
          </span>
        </div>

        {activeSection && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 hidden sm:inline font-semibold">Lesson Status:</span>
            <StatusBadge status={activeSection.workflow_status} size="sm" />
          </div>
        )}
      </header>

      {/* Main Workspace Layout (Full-Width Clean Video & Task Stage - Sidebar Removed) */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        <main className="space-y-8">
          {activeSection ? (
            <>
              {/* Section Title & Navigation Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
                    <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200 font-mono">
                      Lesson {currentIndex !== -1 ? currentIndex + 1 : activeSection.order_index} of {allSectionsList.length || 5}
                    </span>
                    <span>&bull;</span>
                    <span>Sequential Masterclass Gate</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {activeSection.title}
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Watch this lesson video completely with anti-skip verification. Once 100% watched, submit the practical task below. The subsequent lesson unlocks upon Instructor Approval!
                  </p>
                </div>

                {/* Previous / Next Lesson Navigation Pill */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  {prevSection && prevSection.is_unlocked && (
                    <button
                      onClick={() => selectSection(prevSection)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous Lesson</span>
                    </button>
                  )}

                  {nextSection && nextSection.is_unlocked ? (
                    <button
                      onClick={() => selectSection(nextSection)}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-400 select-none">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Next Lesson Locked</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Player Card */}
              {(() => {
                const isRewatchNeeded = (activeSection.workflow_status === 'REJECTED' || activeSection.submission?.status === 'REJECTED') && !isVideoCompleted;
                return (
                  <div className="space-y-4">
                    <CustomVideoPlayer
                      key={`${activeSection.id}-${isRewatchNeeded ? 'rewatch' : 'normal'}`}
                      sectionId={activeSection.id}
                      isForceRewatch={isRewatchNeeded}
                      onVideoCompleted={handleVideoCompleted}
                    />
                  </div>
                );
              })()}

              {/* Assignment Submission Card - Visible only after video completed */}
              <div id="task-assignment-section" className="transition-all rounded-3xl">
                {!isVideoCompleted && !activeSection.submission ? (
                  <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white text-center border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-md mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                        <Lock className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg font-black tracking-wide text-white">
                        Practical Task Locked
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Please watch the lesson video above completely without skipping. Once the video reaches 100% completion, this practical task assignment section will unlock and become visible automatically!
                      </p>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-amber-300 font-semibold">
                        <span>⏳ Sequential Learning Enforcement Active</span>
                      </div>
                    </div>
                  </div>
                ) : (activeSection.assignment || activeSection.assignment_id) ? (
                  <AssignmentCard
                    assignment={
                      activeSection.assignment || {
                        id: activeSection.assignment_id!,
                        section_id: activeSection.id,
                        title: activeSection.assignment_title || 'Practical Task Assignment',
                        instructions: activeSection.assignment_instructions || 'Complete the assignment according to lesson instructions.',
                        submission_type: activeSection.submission_type || 'both',
                      }
                    }
                    initialSubmission={activeSection.submission}
                    isVideoCompleted={isVideoCompleted}
                    onSubmissionSuccess={loadCourseData}
                    nextSectionId={nextSection?.is_unlocked ? nextSection.id : null}
                    onNavigateNext={() => nextSection && selectSection(nextSection)}
                  />
                ) : (
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 text-xs text-slate-500">
                    No task required for this section.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200 text-center max-w-xl mx-auto space-y-6 shadow-sm my-8">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-3">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider rounded-full">
                  Sequential Progression Locked
                </span>
                <h2 className="text-2xl font-black text-slate-900">Program Currently Locked</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  This program is locked. You must first watch <strong>Digital Marketing Masterclass 2026</strong>, submit its practical task, and obtain Admin approval before this program unlocks.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/student/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Return to Learning Desk</span>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
