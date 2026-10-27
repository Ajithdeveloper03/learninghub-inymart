'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Award, 
  CheckCircle, 
  PlayCircle, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Briefcase, 
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  Star,
  CheckCircle2,
  Lock,
  FileCheck
} from 'lucide-react';

export default function SinglePageWebsite() {
  const [enquirySent, setEnquirySent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'Complete Digital Marketing Masterclass',
    message: '',
  });

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        course: 'Complete Digital Marketing Masterclass',
        message: '',
      });
    }, 5000);
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-slate-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* ISO Certification Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-orange-200 rounded-full shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></span>
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-black tracking-wide text-slate-800 uppercase">
                  AN ISO 9001:2015 CERTIFIED ACADEMY &bull; THE BRANDING FOX
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Digital Marketing</span> with Real Agency Ad Spends
              </h1>

              {/* Subheading */}
              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Learn directly from the team behind <strong className="text-slate-800">Inymart - The Branding Fox</strong>. High-impact curriculum covering Meta & Google Ads, SEO, Conversion Funnels, and Content Strategy with 100% hands-on agency live projects.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#courses"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-base shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#contact"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold text-base shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-orange-600" />
                  <span>Book Free Career Session</span>
                </a>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-4 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                  <span>Student Portal</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">100%</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Live Client Spends</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">500+</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Students Trained</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">4.9 / 5</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Student Rating</div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 relative space-y-6">
                {/* Branding Mascot Card */}
                <div className="text-center pb-6 border-b border-slate-100 flex flex-col items-center">
                  <div className="relative w-64 h-36 mb-2 flex items-center justify-center">
                    <img
                      src="/inymart-logo.png"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.tried) {
                          target.dataset.tried = 'true';
                          target.src = '/learninghub/inymart-logo.png';
                        }
                      }}
                      alt="Inymart Academy - The Branding Fox"
                      className="max-h-full max-w-full object-contain drop-shadow-sm"
                    />
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                    Official Training Academy
                  </div>
                </div>

                {/* Workflow Value Props */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Anti-Skip Video Masterclasses</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        95% verified watch time requirement prevents skipping, ensuring full conceptual mastery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Task Submission & Review</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Students execute campaign assignments reviewed directly by senior agency leads.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Single Device Security</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dedicated LMS protects student credentials and proprietary course materials.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Portal Access CTA */}
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Launch Student & Admin Workspace</span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT US SECTION */}
      <section id="about" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-orange-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ABOUT INYMART ACADEMY</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                An ISO 9001:2015 Certified Institution Built on Real-World Agency Excellence
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Inymart - <em>The Branding Fox</em> was founded with a singular mission: to eliminate the gap between theoretical college education and the demanding realities of modern high-growth digital marketing agencies.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                Unlike typical coaching institutes that show slide decks, our students manage real ad budgets, optimize real search engine visibility, formulate omnichannel retention funnels, and get evaluated by full-time practitioners.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Target className="w-6 h-6 text-orange-600 mb-2" />
                  <div className="font-bold text-slate-900 text-sm">Outcome Driven</div>
                  <div className="text-xs text-slate-500 mt-1">Focus on ROAS, CAC, CTR, and business revenue metrics.</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <Briefcase className="w-6 h-6 text-orange-600 mb-2" />
                  <div className="font-bold text-slate-900 text-sm">100% Placement Ready</div>
                  <div className="text-xs text-slate-500 mt-1">Portfolio of 15+ live deliverables for interviews.</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-6 bg-orange-50/70 border border-orange-200/80 rounded-3xl space-y-2">
                    <div className="text-3xl font-black text-orange-600">15+</div>
                    <div className="font-bold text-slate-800 text-sm">Certifications Provided</div>
                    <p className="text-xs text-slate-600">Google Ads, Meta Certified Buyer, HubSpot, Inymart ISO Academy Diploma.</p>
                  </div>
                  <div className="p-6 bg-slate-100 rounded-3xl space-y-2 border border-slate-200">
                    <div className="text-3xl font-black text-slate-900">&#8377;10L+</div>
                    <div className="font-bold text-slate-800 text-sm">Ad Budgets Managed</div>
                    <p className="text-xs text-slate-600">Students test strategies on live client accounts under supervision.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
                    <div className="text-3xl font-black text-emerald-600">94%</div>
                    <div className="font-bold text-slate-800 text-sm">Placement Rate</div>
                    <p className="text-xs text-slate-600">Direct hiring pipelines to leading agencies and tech startups.</p>
                  </div>
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl space-y-2">
                    <div className="text-3xl font-black text-amber-700">1 : 1</div>
                    <div className="font-bold text-slate-800 text-sm">Mentorship Model</div>
                    <p className="text-xs text-slate-600">Every single project submission gets detailed audio/text feedback.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. COURSES & CURRICULUM SECTION */}
      <section id="courses" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Flagship Programs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Industry-Endorsed Digital Marketing Curriculums
            </h2>
            <p className="text-base text-slate-600">
              Structured step-by-step training from basic digital anatomy to advanced attribution modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Course Card 1 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-orange-700">
                    Comprehensive Masterclass
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>12 Weeks &bull; 80 Hours</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Complete Digital Marketing Masterclass
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    The complete end-to-end blueprint covering Search Engine Optimization (SEO), Paid Search, Social Media Marketing, Content Strategy, and Google Analytics 4.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Core Learning Modules
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Foundations of Modern Performance Marketing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>On-Page, Off-Page & Technical SEO Auditing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Google Ads (Search, Display, Performance Max)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Meta Ads Manager & Audience Segmentation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Conversion Rate Optimization & A/B Testing</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-6">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Accreditation</div>
                  <div className="text-sm font-bold text-slate-800">ISO 9001 Certified Diploma</div>
                </div>
                <a
                  href="#contact"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Enroll in Course</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
                    Advanced Specialization
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>8 Weeks &bull; 60 Hours</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Advanced Performance Marketing & Paid Funnels
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Designed for aspiring Media Buyers and Growth Engineers. Deep dive into ROAS optimization, server-side tracking, creative fatigue management, and scaling.
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Core Learning Modules
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Multi-Touch Attribution & Server-Side Tracking (CAPI)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>High-Converting Video Ad Creative Architecture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>E-Commerce Funnels & Shopify Growth Engineering</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>B2B Lead Generation Funnels on LinkedIn & Search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Budget Scaling: Horizontal & Vertical Playbooks</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex items-center justify-between mt-6">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Accreditation</div>
                  <div className="text-sm font-bold text-slate-800">Inymart Performance Specialist</div>
                </div>
                <a
                  href="#contact"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Enroll in Course</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LEARNING METHODOLOGY / SEQUENTIAL UNLOCK WORKFLOW */}
      <section id="methodology" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Rigorous LMS Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Sequential Mastery: How Inymart LMS Works
            </h2>
            <p className="text-base text-slate-600">
              Unlike passive video platforms where students skip through lessons without learning, Inymart enforces an atomic 5-step progression cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                1
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Watch Lesson</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                HD video streaming with dynamic floating watermark displaying student identity to prevent unauthorized copying.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                2
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Anti-Skip Gate</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Forward scrubbing is disabled. The system verifies at least 95% continuous segment coverage before completing the video.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                3
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Submit Assignment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Section task unlocks automatically. Student implements practical work and uploads deliverables (spreadsheets/campaigns).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                4
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Instructor Review</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Academy instructors review the deliverable. If not meeting standards, revision is requested with required guidance.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                5
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Next Section Unlocks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upon instructor approval, the next lesson unlocks atomically in the student dashboard, ensuring cumulative knowledge.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE INYMART */}
      <section id="why-us" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Why Inymart - The Branding Fox</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Built by Practitioners, Trusted by Industry Leaders
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                When you enroll at Inymart, you are not treated like a student in a classroom. You are trained as a junior digital marketing strategist inside a live branding agency.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    &check;
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Real Client Spends & Accounts</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Work on active brand campaigns across E-commerce, Healthcare, Real Estate, and EdTech.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    &check;
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Resume & Mock Interview Coaching</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Technical interview preparation with marketing directors and agency founders.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    &check;
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Lifetime Alumni Community</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Access ongoing algorithm updates, new ad format breakdowns, and exclusive job referrals.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Grid */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic">
                  "The hands-on assignment review model changed everything for me. Inymart's mentors don't let you proceed until your ad campaign structure is airtight. Got placed as a Meta Ads Specialist within 3 weeks of graduating!"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center text-xs">
                    AR
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Alex Rivera</div>
                    <div className="text-[11px] text-slate-500">Performance Marketer at MediaPeak</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic">
                  "The anti-skip system ensures you actually watch and implement every SEO audit and schema markup concept. The ISO certification helped my profile stand out among 200+ applicants."
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                    PS
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Priya Sharma</div>
                    <div className="text-[11px] text-slate-500">SEO Lead at GrowthX Studio</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CONTACT & ADMISSIONS ENQUIRY */}
      <section id="contact" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-orange-700">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>ADMISSIONS OFFICE</span>
              </div>

              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Take the First Step Toward Your Digital Career
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Connect with our academic counselors for a free 1-on-1 profile evaluation and syllabus walk-through.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <MapPin className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Academy Campus</div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Inymart Corporate Towers, Digital Hub, Chennai & Coimbatore, Tamil Nadu, India
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <PhoneCall className="w-5 h-5 text-orange-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Admissions Helpline</div>
                    <a href="tel:+919876543210" className="text-xs text-orange-600 font-bold hover:underline">
                      +91 98765 43210 / +91 91234 56789
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <Mail className="w-5 h-5 text-orange-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Official Inquiries</div>
                    <a href="mailto:admissions@inymart.com" className="text-xs text-slate-700 hover:underline">
                      admissions@inymart.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Form */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Book Free Career Consultation</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below. Our counselor will reach out within 2 hours with syllabus and fee details.
                  </p>
                </div>

                {enquirySent ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-900 text-base">Enquiry Submitted Successfully!</h4>
                    <p className="text-xs text-emerald-700">
                      Thank you for contacting Inymart Academy. Our senior counselor will call you shortly on the provided number.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                          Contact Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="rahul@example.com"
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                          Select Program *
                        </label>
                        <select
                          value={formData.course}
                          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600"
                        >
                          <option value="Complete Digital Marketing Masterclass">
                            Complete Digital Marketing Masterclass
                          </option>
                          <option value="Advanced Performance Marketing & Paid Funnels">
                            Advanced Performance Marketing & Paid Funnels
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                        Questions / Career Goals (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your background or specific tools you want to master..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-hidden focus:border-orange-600"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Admission Enquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
