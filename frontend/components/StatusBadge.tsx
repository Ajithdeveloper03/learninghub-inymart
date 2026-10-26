'use client';

import React from 'react';
import { SectionWorkflowStatus } from '@/types';
import { Lock, Play, Clock, CheckCircle2, FileQuestion, AlertCircle, Check } from 'lucide-react';

interface StatusBadgeProps {
  status?: SectionWorkflowStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status = 'LOCKED', size = 'sm' }: StatusBadgeProps) {
  const configs: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    LOCKED: {
      label: 'Locked',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-300',
      icon: Lock,
    },
    AVAILABLE: {
      label: 'Available',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Play,
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
    },
    VIDEO_COMPLETED: {
      label: 'Video Completed',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: CheckCircle2,
    },
    PENDING_REVIEW: {
      label: 'Pending Review',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: FileQuestion,
    },
    REVISION_REQUIRED: {
      label: 'Revision Requested',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: AlertCircle,
    },
    APPROVED: {
      label: 'Approved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: Check,
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: AlertCircle,
    },
    Active: {
      label: 'Active',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: Check,
    },
    Suspended: {
      label: 'Suspended',
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: AlertCircle,
    },
  };

  const cfg = configs[status] || configs.LOCKED;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses[size]} shadow-2xs`}
    >
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      {cfg.label}
    </span>
  );
}
