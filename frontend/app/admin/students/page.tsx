'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  KeyRound, 
  Laptop, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Lock,
  Smartphone,
  RefreshCw,
  Power,
  Phone,
  Mail,
  Send
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    username: '',
    email: '',
    phone: '',
    full_name: '',
    password: 'Student@' + Math.floor(10000 + Math.random() * 90000),
    course_ids: [1],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchStudents = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`/students?search=${encodeURIComponent(search)}`),
      apiFetch('/courses'),
    ])
      .then(([sRes, cRes]) => {
        if (sRes.success && sRes.data) setStudents(sRes.data);
        if (cRes.success && cRes.data) setCourses(cRes.data);
      })
      .catch((err) => {
        console.warn('Student query error:', err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);
    setModalError(null);

    if (!newStudent.phone.trim()) {
      setModalError('Student mobile number is required.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(newStudent),
      });

      if (res.success) {
        setActionMsg({ 
          type: 'success', 
          text: `Student @${newStudent.username} created & login credentials successfully emailed to ${newStudent.email}!` 
        });
        setCreateModalOpen(false);
        setModalError(null);
        setNewStudent({
          username: '',
          email: '',
          phone: '',
          full_name: '',
          password: 'Student@' + Math.floor(10000 + Math.random() * 90000),
          course_ids: [1],
        });
        fetchStudents();
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to create student account');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStudentStatus = async (id: number) => {
    try {
      await apiFetch(`/students/${id}/suspend`, { method: 'POST' });
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const resetStudentPassword = async (id: number) => {
    const tempPass = 'Student@' + Math.floor(10000 + Math.random() * 90000);
    try {
      const res = await apiFetch(`/students/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: tempPass }),
      });
      if (res.success) {
        alert(`Password reset successfully!\nTemporary Password: ${tempPass}\nStudent must change it upon login.`);
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Reset failed');
    }
  };

  const resetStudentDevice = async (id: number) => {
    if (!confirm('Are you sure you want to revoke active device sessions for this student?')) return;
    try {
      const res = await apiFetch(`/students/${id}/reset-device`, { method: 'POST' });
      if (res.success) {
        alert('All active device sessions revoked. Student can now log in from a new machine.');
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Device reset failed');
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="Student Account Directory"
      subtitle="Register students with email & mobile, dispatch automated login credentials via SMTP, and manage hardware device bindings"
    >
      <div className="space-y-6">
        {/* Action Message Banner */}
        {actionMsg && (
          <div
            className={`w-full p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, username, email, or mobile..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setModalError(null);
                setCreateModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          </div>
        </div>

        {/* Students Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-6">Student Info</th>
                  <th className="py-4 px-6">Email & Mobile</th>
                  <th className="py-4 px-6">Enrollments</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      Loading student directory...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No student accounts found. Click 'Enroll New Student' to register.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-orange-50/30 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {student.full_name ? student.full_name[0].toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{student.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">@{student.username} &bull; ID #{student.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{student.email}</span>
                        </div>
                        {student.phone ? (
                          <div className="text-orange-700 font-semibold text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-orange-600 shrink-0" />
                            <span>{student.phone}</span>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-[10px] mt-0.5">Mobile: Not recorded</div>
                        )}
                      </td>

                      {/* Enrollments & Progress */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full font-bold text-slate-700 text-[11px]">
                          {student.enrolled_courses_count || 1} Courses Enrolled
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                            student.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              student.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          {student.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => toggleStudentStatus(student.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold text-[11px] transition"
                        >
                          {student.is_active ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => resetStudentPassword(student.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-800 font-bold text-[11px] transition"
                        >
                          Reset Password
                        </button>

                        <button
                          onClick={() => resetStudentDevice(student.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-bold text-[11px] transition"
                        >
                          Reset Device
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE STUDENT MODAL (Collects Name, Email, Mobile, Username, Password + Sends via SMTP) */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Enroll Individual Student</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credentials will be automatically dispatched to student's email via Inymart SMTP
                  </p>
                </div>
                <button
                  onClick={() => !isCreating && setCreateModalOpen(false)}
                  disabled={isCreating}
                  className="text-slate-400 hover:text-slate-700 text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isCreating}
                    value={newStudent.full_name}
                    onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                  />
                </div>

                {/* Email and Mobile Number (Mandatory as requested) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Student Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      disabled={isCreating}
                      value={newStudent.email}
                      onChange={(e) => {
                        const emailVal = e.target.value;
                        setNewStudent((prev) => ({
                          ...prev,
                          email: emailVal,
                          username: emailVal, // Email ID is the login username
                        }));
                      }}
                      placeholder="student@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-orange-600 mt-0.5 block font-semibold">
                      Login credentials & password sent here
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      disabled={isCreating}
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Mandatory contact detail
                    </span>
                  </div>
                </div>

                {/* Username and Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Username / Login ID (Email ID) *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isCreating}
                      value={newStudent.username}
                      onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Defaults to email ID for effortless login
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Assigned Password *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isCreating}
                      value={newStudent.password}
                      onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-orange-600 focus:bg-white"
                    />
                    <span className="text-[10px] text-orange-600 mt-0.5 block font-semibold">
                      Sent automatically to student's inbox
                    </span>
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                    Assign Programs
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {courses.map((c) => (
                      <label key={c.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isCreating}
                          checked={newStudent.course_ids.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewStudent({ ...newStudent, course_ids: [...newStudent.course_ids, c.id] });
                            } else {
                              setNewStudent({
                                ...newStudent,
                                course_ids: newStudent.course_ids.filter((id) => id !== c.id),
                              });
                            }
                          }}
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="font-semibold">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Credentials via Email...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enroll & Send Login Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
