'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  BarChart3,
  Bell,
  UserCheck,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  role: 'admin' | 'student';
}

export function DashboardLayout({ children, title, subtitle, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    if (user) {
      apiFetch('/notifications')
        .then((res) => {
          if (res.success && res.data) {
            setUnreadNotifs(res.data.unread_count || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, pathname]);

  interface NavItem {
    label: string;
    href: string;
    icon: any;
    badge?: number;
  }

  const adminNav: NavItem[] = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Student Accounts', href: '/admin/students', icon: Users },
    { label: 'Courses & Curriculum', href: '/admin/courses', icon: BookOpen },
    { label: 'Task Approvals', href: '/admin/approvals', icon: CheckSquare },
    { label: 'Analytics & Audit', href: '/admin/reports', icon: BarChart3 },
  ];

  const studentNav: NavItem[] = [
    { label: 'My Learning Desk', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Notifications', href: '/student/notifications', icon: Bell, badge: unreadNotifs },
    { label: 'Profile & Device', href: '/student/profile', icon: UserCheck },
  ];

  const navItems: NavItem[] = role === 'admin' ? adminNav : studentNav;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <Logo href="/" size="md" />
        <div className="flex items-center gap-2">
          <Link
            href={role === 'admin' ? '/admin/dashboard' : '/student/notifications'}
            className="relative p-2 text-slate-600 hover:text-orange-600"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-600 rounded-full"></span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-700 hover:text-orange-600"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Portal Pill */}
          <div className="p-6 border-b border-slate-100 flex flex-col gap-3">
            <Logo href="/" size="lg" />
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                {role === 'admin' ? 'Super Admin Desk' : 'Student Portal'}
              </span>
              <Link
                href="/"
                target="_blank"
                className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 flex items-center gap-1"
                title="View Public Website"
              >
                <span>Website</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">
              Navigation Menu
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-orange-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        active ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Device Security Assurance Card */}
          <div className="p-4 mx-4 mb-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Single Device Lock</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Active hardware fingerprint validated. Unauthorized logins are revoked automatically.
            </p>
          </div>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {user?.full_name || user?.username || 'User'}
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 truncate">
                    @{user?.username}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-4">
            {/* Device Lock Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Device Protected</span>
            </div>

            {/* Notifications Button */}
            <Link
              href={role === 'admin' ? '/admin/dashboard' : '/student/notifications'}
              className="relative p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors border border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </Link>

            {/* User Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">
                  {user?.full_name || 'Admin User'}
                </div>
                <div className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                  {role === 'admin' ? 'Super Admin' : 'Enrolled Student'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
