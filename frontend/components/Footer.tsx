'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ShieldCheck, Mail, MapPin, Phone, Award, CheckCircle, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Logo href="/" size="xl" />
            <p className="text-sm text-slate-600 leading-relaxed pt-2">
              Inymart Academy - The Branding Fox is Tamil Nadu's premier institution for performance digital marketing, real ad budgets, and agency-level practical execution.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-lg text-xs font-bold text-orange-800">
              <Award className="w-4 h-4 text-orange-600" />
              <span>AN ISO 9001:2015 CERTIFIED ACADEMY</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">
              Academy Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/#courses" className="hover:text-orange-600 transition-colors">
                  Complete Digital Marketing Masterclass
                </a>
              </li>
              <li>
                <a href="/#courses" className="hover:text-orange-600 transition-colors">
                  Performance Marketing & Paid Ads Funnel
                </a>
              </li>
              <li>
                <a href="/#methodology" className="hover:text-orange-600 transition-colors">
                  Sequential Learning System
                </a>
              </li>
              <li>
                <a href="/#why-us" className="hover:text-orange-600 transition-colors">
                  Placement & Agency Live Projects
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Security */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-4 uppercase tracking-wider">
              LMS Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Single Active Device Protection</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dynamic Floating Watermark</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Anti-Skip Verification (&ge;95%)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instructor Approval Gates</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          {/* Contact Info */}
          <div>
            <h4 className="text-orange-600 font-bold text-base mb-4 tracking-tight">
              Contact Info
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <a href="tel:+918925807468" className="hover:text-orange-600 font-semibold text-slate-800">
                  +91 89258 07468
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-600 shrink-0" />
                <a href="mailto:digitalmarketing@inymart.in" className="hover:text-orange-600 text-slate-700">
                  digitalmarketing@inymart.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-600 mt-1 shrink-0" />
                <span className="text-slate-600 leading-relaxed text-xs">
                  No.17, C3, 3rd Floor, Ayodhya Complex, Thennur High Road, Srinivasapuram, Tennur, Tiruchirappalli, Tamil Nadu 620017.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="text-slate-700 font-medium text-xs">
                  Mon - Sat: 10:00 AM - 6:30 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Inymart Academy (The Branding Fox). All rights reserved. An ISO 9001:2015 Certified Institution.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-orange-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
              Student / Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
