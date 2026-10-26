'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Academy Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms & Conditions</h1>
        <p className="text-xs text-slate-500">Effective: Academic Year 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Sequential Progression & Approval Criteria</h2>
          <p>
            Enrollment grants access to course sections sequentially. Bypassing video playback controls, seeking ahead
            without verified coverage, or fabricating progress is strictly prohibited. The subsequent section unlocks
            only after an authorized instructor evaluates and issues an APPROVED decision on your assignment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Intellectual Property Protection</h2>
          <p>
            Video lectures, course curriculum, and instructional assignments belong exclusively to INYMART Academy.
            Screen capturing, recording, sharing credentials, or distributing materials is a violation of copyright law
            and will result in immediate suspension and forfeiture of enrollment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Single Active Device Rule</h2>
          <p>
            Each student account is licensed for use on one active authenticated device at a time. Concurrently active
            browser sessions from multiple locations will be automatically terminated by the system security engine.
          </p>
        </section>
      </div>
    </div>
  );
}
