'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  BookOpen, 
  Video, 
  Lock, 
  FileCheck, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Award,
  Layers
} from 'lucide-react';

export default function CourseDetailsClient({ initialId }: { initialId: string }) {
  const [courseId, setCourseId] = useState(initialId);
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // In static export, read the actual ID from window.location if rewritten
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/courses\/([^\/]+)/);
      if (match && match[1] && match[1] !== courseId) {
        setCourseId(match[1]);
      }
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    apiFetch(`/courses/${courseId}`)
      .then((res) => {
        if (res.success && res.data) {
          setCourse(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading syllabus...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen py-24 text-center">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <Link href="/courses" className="mt-4 text-blue-400 inline-block">
          Return to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Course Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full text-xs font-semibold uppercase tracking-wider">
            {course.level} Level
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {course.title}
          </h1>
          {course.subtitle && <p className="text-base text-blue-300/90">{course.subtitle}</p>}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-2">{course.description}</p>

          <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div>
              Instructor: <span className="text-white font-semibold">{course.instructor_name}</span>
            </div>
            <div>
              Modules: <span className="text-white font-semibold">{course.modules?.length || 0}</span>
            </div>
            <div>
              Tuition: <span className="text-emerald-400 font-bold text-sm">${parseFloat(String(course.price)).toFixed(0)}</span>
            </div>
          </div>

          <div className="pt-6">
            {user?.role === 'student' ? (
              <Link
                href={`/student/courses/${course.id}`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <span>Go to Student Learning Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <span>Sign in to Access Assigned Course</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Breakdown */}
      <div className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Curriculum Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Sequential Modules & Verified Deliverables
          </h2>
        </div>

        <div className="space-y-6">
          {course.modules?.map((module, mIdx) => (
            <div
              key={module.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Module Header */}
              <div className="p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-400">MODULE {mIdx + 1}</div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{module.title}</h3>
                  {module.description && (
                    <p className="text-xs text-slate-400 mt-1">{module.description}</p>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  {module.sections?.length || 0} Sections
                </div>
              </div>

              {/* Sections list */}
              <div className="divide-y divide-slate-800/60">
                {module.sections?.map((section, sIdx) => (
                  <div
                    key={section.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">
                          {mIdx + 1}.{sIdx + 1}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-slate-200">
                          {section.title}
                        </h4>
                        {Boolean(section.is_free_preview) && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded">
                            Preview
                          </span>
                        )}
                      </div>

                      {section.description && (
                        <p className="text-xs text-slate-400 leading-relaxed pl-7">
                          {section.description}
                        </p>
                      )}

                      {section.assignment_title && (
                        <div className="pl-7 pt-1 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Task: {section.assignment_title}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:pl-4">
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>{section.duration_seconds || 180}s</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Approval Required</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
