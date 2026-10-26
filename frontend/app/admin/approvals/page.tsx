'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '@/lib/api';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileText, 
  ChevronLeft,
  ArrowRight,
  Filter,
  Check,
  Send,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  X,
  Maximize2
} from 'lucide-react';

export default function AdminApprovalsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    const endpoint = filter === 'pending' ? '/admin/submissions/pending' : '/admin/submissions/all';
    apiFetch(endpoint)
      .then((res) => {
        if (res.success && res.data) {
          setSubmissions(res.data);
          if (res.data.length > 0 && !selectedSub) {
            apiFetch(`/submissions/${res.data[0].id}`).then((d) => {
              if (d.success) setSelectedSub(d.data);
            });
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const selectSubmission = (id: number) => {
    apiFetch(`/submissions/${id}`).then((d) => {
      if (d.success) setSelectedSub(d.data);
    });
  };

  const handleDecision = async (decision: 'APPROVE' | 'REVISION' | 'REJECT') => {
    if (!selectedSub) return;
    setSubmittingDecision(true);

    try {
      let endpoint = `/submissions/${selectedSub.id}/approve`;
      let body: any = { remarks: feedback };

      if (decision === 'REVISION') {
        endpoint = `/submissions/${selectedSub.id}/request-revision`;
      } else if (decision === 'REJECT') {
        endpoint = `/submissions/${selectedSub.id}/reject`;
      }

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.success) {
        alert(`Decision applied: ${decision}. Next section status updated.`);
        setFeedback('');
        fetchQueue();
        setSelectedSub(null);
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setSubmittingDecision(false);
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="Task & Deliverable Verification"
      subtitle="Review student campaign assignments, provide structured feedback, and unlock subsequent curriculum modules"
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'pending'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending Verification ({submissions.filter((s) => s.status === 'PENDING_REVIEW').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Submission History
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500">
            {submissions.length} Total Records
          </div>
        </div>

        {/* 2-Column Split: Queue list & Inspection Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Submissions Queue */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              Deliverables Queue
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading submission queue...</div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">No submissions found for current filter.</div>
            ) : (
              submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => selectSubmission(sub.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-orange-50/80 border-l-4 border-orange-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {sub.student_name}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>

                    <div className="text-xs text-slate-600 truncate font-medium">
                      {sub.section_title}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>@{sub.student_username}</span>
                      <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Review Desk */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {!selectedSub ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select an assignment submission from the left queue to inspect deliverables and render decision.
              </div>
            ) : (
              <>
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
                      Detailed Inspection Desk
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{selectedSub.section_title}</h3>
                    <div className="text-xs text-slate-500">
                      Student: <strong className="text-slate-800">{selectedSub.student_name}</strong> (@{selectedSub.student_username})
                    </div>
                  </div>
                  <StatusBadge status={selectedSub.status} size="md" />
                </div>

                {/* Assignment Deliverable Text */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Student Written Strategy / Submission Text
                  </label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedSub.submission_text || 'No text notes provided by student.'}
                  </div>
                </div>

                {/* Attachments & Deliverables Viewer */}
                {selectedSub.attachments && selectedSub.attachments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase text-slate-700">
                        Submitted Deliverable Attachments ({selectedSub.attachments.length})
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">Click to inspect or download</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {selectedSub.attachments.map((att: any) => {
                        const token = getAuthToken() || '';
                        const fileName = att.original_filename || att.file_name || 'attachment';
                        const fileSize = att.file_size || att.file_size_bytes || 0;
                        const isImage = (att.mime_type && att.mime_type.startsWith('image/')) || /\.(jpe?g|png|gif|webp|svg)$/i.test(fileName);
                        const isPdf = (att.mime_type && att.mime_type === 'application/pdf') || /\.pdf$/i.test(fileName);
                        const inlineUrl = `/api/submissions/${selectedSub.id}/download/${att.id}?inline=1&token=${encodeURIComponent(token)}`;
                        const downloadUrl = `/api/submissions/${selectedSub.id}/download/${att.id}?token=${encodeURIComponent(token)}`;

                        return (
                          <div
                            key={att.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 text-orange-600">
                                  {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold text-slate-900 truncate" title={fileName}>
                                    {fileName}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                    <span>{(fileSize / 1024).toFixed(1)} KB</span>
                                    <span>•</span>
                                    <span className="uppercase">{att.mime_type || (isImage ? 'IMAGE' : isPdf ? 'PDF' : 'FILE')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {isImage && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage({ url: inlineUrl, name: fileName })}
                                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                    title="Quick Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </button>
                                )}

                                <a
                                  href={inlineUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Open</span>
                                </a>

                                <a
                                  href={downloadUrl}
                                  download={fileName}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                  title="Download"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </a>
                              </div>
                            </div>

                            {/* Inline Thumbnail for Images */}
                            {isImage && (
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                <div 
                                  className="relative group cursor-pointer max-w-sm rounded-lg overflow-hidden border border-slate-200 bg-slate-900/5 aspect-video flex items-center justify-center"
                                  onClick={() => setPreviewImage({ url: inlineUrl, name: fileName })}
                                >
                                  <img
                                    src={inlineUrl}
                                    alt={fileName}
                                    className="max-h-48 w-full object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                                    <Maximize2 className="w-4 h-4" />
                                    <span>Click to enlarge</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feedback Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase text-slate-700">
                    Instructor Remarks / Required Corrections
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback, campaign metrics evaluation, or revisions required..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-hidden focus:border-orange-600 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    * Remarks are mandatory if requesting revisions.
                  </span>
                </div>

                {/* Decision Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                  <button
                    disabled={submittingDecision}
                    onClick={() => handleDecision('REVISION')}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    Request Revision
                  </button>

                  <button
                    disabled={submittingDecision}
                    onClick={() => handleDecision('REJECT')}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    Reject Submission
                  </button>

                  <button
                    disabled={submittingDecision}
                    onClick={() => handleDecision('APPROVE')}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Unlock Next Section</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold truncate">
                <ImageIcon className="w-4 h-4 text-orange-400" />
                <span className="truncate">{previewImage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                  title="Open full size in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-2 overflow-auto flex items-center justify-center bg-slate-950/5 min-h-[300px]">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
