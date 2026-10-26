'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Remove Header & Footer on Login page and on all Admin/Student dashboard pages
  const isAuthOrDashboard =
    pathname.startsWith('/admin') || pathname.startsWith('/student') || pathname === '/login';

  if (isAuthOrDashboard) {
    return <main className="min-h-screen w-full bg-slate-50 text-slate-900">{children}</main>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
