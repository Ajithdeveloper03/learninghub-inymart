'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { Award, ShieldCheck, Target, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 bg-slate-50">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
          <Award className="w-4 h-4 text-orange-600" />
          <span>Our Academy Pedagogy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About Inymart - The Branding Fox
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Founded as Tamil Nadu's flagship performance marketing agency, Inymart Academy was built to eliminate the gap
          between generic theoretical video courses and high-stakes performance marketing. An ISO 9001:2015 Certified Institution.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Execution-First Learning</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every concept taught in our video lectures translates into a tangible deliverable: real client search audits,
            live ad campaign builds, and multi-channel attribution models.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Rigorous 1-on-1 Reviews</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Progression is not automatic. Dedicated academy instructors evaluate your campaign tasks, provide line-by-line
            critiques, and unlock subsequent modules only when standards are met.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Secure Intellectual Property</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Proprietary blueprints, case studies, and templates are protected via strict server-side video delivery,
            anti-skip watch enforcement, and single-device authentication.
          </p>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link
          href="/#courses"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition"
        >
          <span>Explore Programs & Courses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
