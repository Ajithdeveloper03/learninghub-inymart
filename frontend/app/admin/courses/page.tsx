'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { apiFetch } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { 
  BookOpen, 
  Plus, 
  Layers, 
  Video, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Upload,
  AlertCircle,
  FileCheck,
  Check,
  Pencil,
  Trash2,
  X
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModal, setCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    video_url: '',
    task_title: '',
    task_instructions: '',
    price: 499,
    level: 'all',
    is_published: 1,
  });

  // Edit Modal & Delete state
  const [editModal, setEditModal] = useState<Course | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    price: 499,
    level: 'all',
    is_published: 1,
    task_title: '',
    task_instructions: '',
  });

  const fetchCourses = () => {
    setLoading(true);
    apiFetch('/courses')
      .then((res) => {
        if (res.success && res.data) setCourses(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenEdit = (course: Course) => {
    setEditModal(course);
    const firstSection = course.modules?.[0]?.sections?.[0];
    setEditForm({
      title: course.title || '',
      slug: course.slug || '',
      subtitle: course.subtitle || '',
      description: course.description || '',
      price: Number(course.price) || 0,
      level: course.level || 'all',
      is_published: course.is_published ? 1 : 0,
      task_title: firstSection?.assignment?.title || firstSection?.assignment_title || '',
      task_instructions: firstSection?.assignment?.instructions || firstSection?.assignment_instructions || '',
    });
    setEditVideoFile(null);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('slug', editForm.slug);
      formData.append('subtitle', editForm.subtitle);
      formData.append('description', editForm.description);
      formData.append('price', String(editForm.price));
      formData.append('level', editForm.level);
      formData.append('is_published', String(editForm.is_published));
      if (editForm.task_title) {
        formData.append('task_title', editForm.task_title);
      }
      if (editForm.task_instructions) {
        formData.append('task_instructions', editForm.task_instructions);
      }
      if (editVideoFile) {
        formData.append('video_file', editVideoFile);
      }

      const res = await apiFetch(`/courses/${editModal.id}`, {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        setEditModal(null);
        setEditVideoFile(null);
        fetchCourses();
      } else {
        alert(res.message || 'Failed to update course');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update course');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${course.title}" (ID: #${course.id})?\n\nThis will remove all associated modules, video lessons, and tasks.`
    );
    if (!confirmed) return;

    setDeletingId(course.id);
    try {
      const res = await apiFetch(`/courses/${course.id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        fetchCourses();
      } else {
        alert(res.message || 'Failed to delete course');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('slug', newCourse.slug);
      formData.append('subtitle', newCourse.subtitle);
      formData.append('description', newCourse.description);
      formData.append('video_url', newCourse.video_url);
      formData.append('task_title', newCourse.task_title);
      formData.append('task_instructions', newCourse.task_instructions);
      formData.append('price', String(newCourse.price));
      formData.append('level', newCourse.level);
      formData.append('is_published', String(newCourse.is_published));
      if (videoFile) {
        formData.append('video_file', videoFile);
      }

      const res = await apiFetch('/courses', {
        method: 'POST',
        body: formData,
      });

      if (res.success) {
        setCreateModal(false);
        setVideoFile(null);
        setNewCourse({
          title: '',
          slug: '',
          subtitle: '',
          description: '',
          video_url: '',
          task_title: '',
          task_instructions: '',
          price: 499,
          level: 'all',
          is_published: 1,
        });
        fetchCourses();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="Courses & Video Curriculum Management"
      subtitle="Organize modular curriculum, configure video streaming assets, and define sequential approval gates"
    >
      <div className="space-y-6">
        {/* Action Header Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">
            {courses.length} Active Masterclass Curriculums
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400">No courses found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      {course.level || 'Masterclass'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        course.is_published
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          course.is_published ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      ></span>
                      {course.is_published ? 'Live & Published' : 'Draft'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Modules Accordion Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Structured Modules ({course.modules?.length || 0})
                    </div>
                    {course.modules && course.modules.length > 0 ? (
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {course.modules.slice(0, 3).map((m: any, idx: number) => (
                          <div key={m.id || idx} className="flex items-center justify-between font-semibold">
                            <span className="truncate">Module {idx + 1}: {m.title}</span>
                            <span className="text-slate-400 font-mono text-[11px]">
                              {m.sections?.length || 0} Lessons
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">No modules configured yet.</div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-700">
                    ID: #{course.id} &bull; Slug: <span className="font-mono text-slate-500">{course.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(course)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      title="Edit Course Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course)}
                      disabled={deletingId === course.id}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-xs"
                      title="Delete Course"
                    >
                      {deletingId === course.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE COURSE MODAL */}
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs overflow-y-auto">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-xl text-slate-900">Add New Academy Course</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure course heading, curriculum details, video lesson URL, and assigned student task
                  </p>
                </div>
                <button
                  onClick={() => setCreateModal(false)}
                  className="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                {/* Course Heading */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Course Heading / Title *</label>
                  <input
                    type="text"
                    required
                    value={newCourse.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setNewCourse({
                        ...newCourse,
                        title: t,
                        slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      });
                    }}
                    placeholder="e.g. Performance Marketing & Google Ads Masterclass 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={newCourse.slug}
                    onChange={(e) => setNewCourse({ ...newCourse, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-slate-800 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Course Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    placeholder="Comprehensive overview of modules, marketing strategy frameworks, live campaign execution, and objectives..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                {/* Lesson Video Upload */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase text-slate-700">
                    Upload Lesson Video (MP4 / WebM) *
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-4 text-center transition bg-slate-50 hover:bg-orange-50/20">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Video className="w-5 h-5 text-orange-600" />
                      <div className="text-xs font-semibold text-slate-700">
                        {videoFile ? (
                          <span className="text-orange-700 font-bold">Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                        ) : (
                          <span>Click to upload section video file (MP4)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">This uploaded video will be watched by students in this section.</div>
                    </div>
                  </div>
                </div>

                {/* Optional Fallback Video URL */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Or Video URL (Optional if file uploaded)
                  </label>
                  <input
                    type="text"
                    value={newCourse.video_url}
                    onChange={(e) => setNewCourse({ ...newCourse, video_url: e.target.value })}
                    placeholder="videos/academy_master_video.mp4 or direct MP4 stream URL"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to use default academy masterclass video if no file is uploaded.
                  </p>
                </div>

                {/* Task Instructions */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Assign Practical Task (Instructions for Student) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newCourse.task_instructions}
                    onChange={(e) => setNewCourse({ ...newCourse, task_instructions: e.target.value })}
                    placeholder="Enter instructions for student task (e.g., Set up 3 ad groups, target keywords, write headline copy, and submit campaign file/notes)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This task will remain locked until the student finishes watching 100% of the video lesson.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Course & Setting Curriculum...</span>
                      </>
                    ) : (
                      <span>Save & Create Course</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT COURSE MODAL */}
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs overflow-y-auto">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-xl text-slate-900">Edit Academy Course</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update course title, curriculum details, lesson video, and assigned practical task
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="text-slate-400 hover:text-slate-800 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateCourse} className="space-y-4 text-xs">
                {/* Course Heading */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Course Heading / Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="e.g. Digital Marketing Masterclass 2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                {/* Slug & Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono text-slate-800 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase text-slate-700 mb-1">Skill Level</label>
                    <select
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Publication Status</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="is_published"
                        value="1"
                        checked={Number(editForm.is_published) === 1}
                        onChange={() => setEditForm({ ...editForm, is_published: 1 })}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-slate-800">Live & Published</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="is_published"
                        value="0"
                        checked={Number(editForm.is_published) === 0}
                        onChange={() => setEditForm({ ...editForm, is_published: 0 })}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="font-semibold text-slate-600">Draft (Unpublished)</span>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">Course Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Comprehensive overview of modules, marketing strategy frameworks..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                {/* Optional Replace Lesson Video */}
                <div className="space-y-1.5">
                  <label className="block font-bold uppercase text-slate-700">
                    Replace Lesson Video (Optional)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-4 text-center transition bg-slate-50 hover:bg-orange-50/20">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEditVideoFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Video className="w-5 h-5 text-orange-600" />
                      <div className="text-xs font-semibold text-slate-700">
                        {editVideoFile ? (
                          <span className="text-orange-700 font-bold">Selected: {editVideoFile.name} ({(editVideoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                        ) : (
                          <span>Click to upload new video file (leave empty to keep existing)</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Uploading a file will update Section 1's video lesson asset.</div>
                    </div>
                  </div>
                </div>

                {/* Task Instructions */}
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Practical Task Instructions (Section 1)
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.task_instructions}
                    onChange={(e) => setEditForm({ ...editForm, task_instructions: e.target.value })}
                    placeholder="Enter instructions for student task..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {editSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
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
