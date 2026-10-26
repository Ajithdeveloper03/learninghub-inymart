'use client';

import React, { useState } from 'react';
import { Assignment, Submission } from '@/types';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send, 
  FileCheck, 
  ArrowRight,
  Download,
  Lock
} from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  initialSubmission?: Submission | null;
  isVideoCompleted: boolean;
  onSubmissionSuccess?: () => void;
  nextSectionId?: number | null;
  onNavigateNext?: () => void;
}

export function AssignmentCard({
  assignment,
  initialSubmission = null,
  isVideoCompleted,
  onSubmissionSuccess,
  nextSectionId,
  onNavigateNext,
}: AssignmentCardProps) {
  const [submission, setSubmission] = useState<Submission | null>(initialSubmission);
  const [submissionText, setSubmissionText] = useState(initialSubmission?.submission_text || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const status = submission?.status;
  const isApproved = status === 'APPROVED';
  const isPending = status === 'PENDING_REVIEW';
  const isRevision = status === 'REVISION_REQUIRED';
  const isRejected = status === 'REJECTED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isVideoCompleted) {
      setErrorMsg('You must watch and complete the video lesson before submitting this task.');
      return;
    }

    if (!submissionText.trim() && !file) {
      setErrorMsg('Please enter a response or upload a file for your assignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignment_id', String(assignment.id));
      if (submissionText.trim()) {
        formData.append('submission_text', submissionText.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      const res = await apiFetch('/submissions', {
        method: 'POST',
        body: formData,
      });

      if (res.success && res.data) {
        setSubmission(res.data);
        setSuccessMsg('Your assignment has been submitted! It is now pending instructor review.');
        if (onSubmissionSuccess) onSubmissionSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
              Practical Task Assignment
            </div>
            <h3 className="text-xl font-black text-slate-900">{assignment.title}</h3>
          </div>
        </div>

        {status && <StatusBadge status={status} size="md" />}
      </div>

      {/* Description / Instructions */}
      <div className="mt-6 space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Assignment Instructions & Requirements
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {assignment.instructions}
        </div>
      </div>

      {/* APPROVED BANNER */}
      {isApproved && (
        <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle className="w-6 h-6 shrink-0 text-emerald-600" />
            <div>
              <h4 className="font-extrabold text-base text-emerald-900">Assignment Approved!</h4>
              <p className="text-xs text-emerald-700">
                Reviewed by {submission?.reviewer_name || 'Instructor'} on{' '}
                {submission?.reviewed_at ? new Date(submission.reviewed_at).toLocaleDateString() : 'recently'}.
              </p>
            </div>
          </div>

          {submission?.admin_feedback && (
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700">
              <span className="font-bold text-emerald-700">Instructor Remarks: </span>
              {submission.admin_feedback}
            </div>
          )}

          {nextSectionId && (
            <div className="pt-2">
              <button
                onClick={onNavigateNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <span>Proceed to Next Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* REVISION REQUIRED ALERT */}
      {isRevision && (
        <div className="mt-6 p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-3 text-amber-900">
            <AlertCircle className="w-6 h-6 shrink-0 text-amber-600" />
            <div>
              <h4 className="font-extrabold text-base text-amber-900">Revision Requested by Instructor</h4>
              <p className="text-xs text-amber-700">
                Please review the feedback below, revise your submission, and submit again to unlock the next section.
              </p>
            </div>
          </div>

          {submission?.admin_feedback && (
            <div className="p-4 bg-white rounded-xl border border-amber-200 text-xs text-slate-800 whitespace-pre-line">
              <div className="font-bold text-amber-800 mb-1">Feedback from Instructor:</div>
              {submission.admin_feedback}
            </div>
          )}
        </div>
      )}

      {/* REJECTED ALERT BANNER */}
      {isRejected && (
        <div className={`mt-6 p-6 rounded-2xl border space-y-3 ${
          isVideoCompleted ? 'bg-amber-50/70 border-amber-300' : 'bg-rose-50 border-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-6 h-6 shrink-0 ${isVideoCompleted ? 'text-amber-600' : 'text-rose-600'}`} />
            <div>
              <h4 className={`font-extrabold text-base ${isVideoCompleted ? 'text-amber-950' : 'text-rose-950'}`}>
                {isVideoCompleted ? 'Previous Submission Was Rejected (Re-watch Complete)' : 'Task Rejected by Instructor'}
              </h4>
              <p className={`text-xs ${isVideoCompleted ? 'text-amber-800' : 'text-rose-800'}`}>
                {isVideoCompleted
                  ? 'You have completed re-watching the video masterclass. The practical task is now unlocked! Please review the feedback below, make corrections, and resubmit.'
                  : 'Your previous submission was rejected. As per academy standards, you are required to re-watch the video lesson completely before you can resubmit this task.'}
              </p>
            </div>
          </div>

          {submission?.admin_feedback && (
            <div className={`p-4 bg-white rounded-xl border text-xs text-slate-800 whitespace-pre-line ${
              isVideoCompleted ? 'border-amber-200' : 'border-rose-200'
            }`}>
              <div className={`font-bold mb-1 ${isVideoCompleted ? 'text-amber-800' : 'text-rose-800'}`}>
                Instructor Rejection Remarks:
              </div>
              {submission.admin_feedback}
            </div>
          )}
        </div>
      )}

      {/* PENDING REVIEW BANNER */}
      {isPending && (
        <div className="mt-6 p-6 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-4">
          <Clock className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-purple-900">Awaiting Instructor Review</h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              Your assignment was submitted on{' '}
              {submission?.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'recently'}. Once the
              instructor reviews and approves your submission, access to the subsequent lesson will automatically unlock.
            </p>
          </div>
        </div>
      )}

      {/* Submission Form (Shown if available, revision required, or student wants to update pending) */}
      {!isApproved && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Locked Notice */}
          {!isVideoCompleted ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-200/60 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <span className="font-extrabold text-amber-950">
                  {isRejected ? 'Task Locked (Re-watch Mandatory): ' : 'Practical Task Locked: '}
                </span>
                {isRejected
                  ? 'Your submission was rejected. You must re-watch the video lesson from start to finish (forward seeking disabled). Once watched, this form unlocks for resubmission.'
                  : 'Video lesson must be watched completely in real-time. Fast-forwarding is disabled. Once the video finishes, this task submission form will unlock automatically.'}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-200/60 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="font-extrabold text-emerald-950">
                  {isRejected ? 'Video Re-watched & Task Unlocked: ' : 'Video Lesson Completed: '}
                </span>
                {isRejected
                  ? 'You have completed re-watching the video lesson. You may now update your response and submit your revised task.'
                  : 'Practical task is now unlocked! Please submit your written response or deliverables below for instructor review.'}
              </div>
            </div>
          )}

          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              Written Response / Campaign Notes / Links
            </label>
            <textarea
              rows={5}
              disabled={!isVideoCompleted || isSubmitting}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste your ad copy, campaign structure, target persona breakdown, or shareable Google Drive links..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-300 p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-600 focus:bg-white disabled:opacity-50 transition"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              Deliverable File Attachment (PDF, XLSX, ZIP, PNG, Max 10MB)
            </label>
            <div className="relative border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-6 text-center transition bg-slate-50 hover:bg-orange-50/20">
              <input
                type="file"
                disabled={!isVideoCompleted || isSubmitting}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-6 h-6 text-orange-600" />
                <div className="text-xs font-semibold text-slate-700">
                  {file ? (
                    <span className="text-orange-700 font-bold">{file.name}</span>
                  ) : (
                    <span>Click or drag and drop your deliverable file</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">Supported formats: PDF, DOCX, ZIP, XLSX, PNG, JPG</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!isVideoCompleted || isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Deliverable...' : isRejected ? 'Resubmit Deliverable (Re-watched)' : isRevision ? 'Resubmit for Re-Review' : 'Submit Task for Review'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
