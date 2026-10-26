'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/Logo';
import { 
  Menu, 
  X,
  LayoutDashboard,
  LogIn,
  Sparkles
} from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About Academy', href: '/#about' },
    { label: 'Programs & Courses', href: '/#courses' },
    { label: 'Learning Methodology', href: '/#methodology' },
    { label: 'Why Inymart', href: '/#why-us' },
    { label: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
        {/* Brand Logo with Authentic Fox */}
        <Logo href="/" size="lg" />

        {/* Desktop Single-Page Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action: Login / Dashboard */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <Link
              href={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-2.2 rounded-full font-bold text-sm shadow-sm hover:shadow transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-5 py-2.2 rounded-full font-bold text-sm shadow-sm hover:shadow transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Student / Admin Login</span>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-orange-600 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open {user.role === 'admin' ? 'Admin' : 'Student'} Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Student / Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
