'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: October 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-slate-300 space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When registering or logging in to INYMART Digital Marketing Academy LMS, we collect account details (name,
            username, email address), authenticated device session identifiers (IP address, user agent, browser client),
            and granular playback and submission progression records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Video Watermarking & Anti-Piracy Deterrence</h2>
          <p>
            To prevent content leakage of proprietary course materials, video streams dynamically display floating
            watermarks incorporating student usernames, active session hints, and network IP stamps.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Device Binding & Active Sessions</h2>
          <p>
            The platform enforces a single active device policy for enrolled students. New authentications invalidate
            pre-existing sessions to safeguard student accounts against unauthorized access or credential sharing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Assignment Submissions & Private Storage</h2>
          <p>
            All submitted strategy papers, spreadsheets, and files are stored outside the public web root in private
            encrypted server storage, accessible solely to the student and authorized academy review instructors.
          </p>
        </section>
      </div>
    </div>
  );
}
