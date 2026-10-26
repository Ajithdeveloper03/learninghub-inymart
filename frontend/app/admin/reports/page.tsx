'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  Activity, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  ChevronLeft,
  Users,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function AdminReportsPage() {
  const [progressReport, setProgressReport] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'students' | 'audit'>('students');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/reports/student-progress'),
      apiFetch('/reports/audit-logs'),
    ])
      .then(([pRes, aRes]) => {
        if (pRes.success && pRes.data) setProgressReport(pRes.data);
        if (aRes.success && aRes.data) setAuditLogs(aRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      role="admin"
      title="Audit Logs & Academy Analytics"
      subtitle="Exportable student progress audits, course completion tracking, and device security event logs"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Tab Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === 'students'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Student Progress Summary
            </button>
            <button
              onClick={() => setTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === 'audit'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              System Security Audit Logs
            </button>
          </div>

          {/* CSV Export Action Button */}
          <a
            href={`/api/reports/export-csv?type=${tab}`}
            download
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Export CSV Report</span>
          </a>
        </div>

        {/* Report Content Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {tab === 'students' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">Student Account</th>
                    <th className="py-4 px-6">Course Name</th>
                    <th className="py-4 px-6">Sections Completed</th>
                    <th className="py-4 px-6">Watch Time</th>
                    <th className="py-4 px-6 text-right">Last Progress Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">Loading progress data...</td>
                    </tr>
                  ) : progressReport.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No student progress recorded yet.</td>
                    </tr>
                  ) : (
                    progressReport.map((row, i) => (
                      <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{row.student_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{row.student_username}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800">{row.course_title}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full font-bold text-emerald-700 text-[11px]">
                            {row.completed_sections_count} Sections
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">
                          {Math.floor((row.total_seconds_watched || 0) / 60)} mins
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500 text-[11px]">
                          {row.last_active_at ? new Date(row.last_active_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Actor</th>
                    <th className="py-4 px-6">Event Action</th>
                    <th className="py-4 px-6">Target Entity</th>
                    <th className="py-4 px-6 text-right">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">Loading audit trail...</td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No security audit records logged.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-orange-50/30 transition-colors">
                        <td className="py-4 px-6 text-slate-500 text-[11px] font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900">{log.actor_name || 'System'}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md font-mono font-bold text-[11px] text-orange-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                          {log.entity_type} #{log.entity_id}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500 font-mono text-[11px]">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
