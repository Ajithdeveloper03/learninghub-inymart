'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from '@/types';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Bell, Check, Clock, ChevronLeft } from 'lucide-react';

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    apiFetch('/notifications')
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    await apiFetch('/notifications/read-all', { method: 'POST' });
    fetchNotifs();
  };

  const markSingleRead = async (id: number) => {
    await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
    fetchNotifs();
  };

  return (
    <DashboardLayout
      role="student"
      title="Notifications & Instructor Feedback"
      subtitle="Review assignment evaluations, approval notices, and curriculum announcements"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">
            {notifications.filter((n) => !n.is_read).length} Unread Notifications
          </span>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs font-bold text-orange-800 rounded-xl transition"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No notifications found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`py-4 flex items-start justify-between gap-4 transition-colors ${
                    !n.is_read ? 'bg-orange-50/40 -mx-4 px-4 rounded-xl' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{n.title}</span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => markSingleRead(n.id)}
                      className="shrink-0 p-2 text-slate-400 hover:text-orange-600 transition"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
