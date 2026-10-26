'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'compact' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  href?: string;
  showSubtitle?: boolean;
}

export function Logo({
  variant = 'full',
  size = 'lg',
  className = '',
  href = '/',
  showSubtitle = false,
}: LogoProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'h-9 max-w-[130px]',
    md: 'h-12 max-w-[180px]',
    lg: 'h-16 max-w-[240px]',
    xl: 'h-20 max-w-[300px]',
    '2xl': 'h-24 max-w-[360px]',
  };

  const containerHeights: Record<string, string> = {
    sm: 'h-10',
    md: 'h-13',
    lg: 'h-16',
    xl: 'h-20',
    '2xl': 'h-24',
  };

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${containerHeights[size] || 'h-16'} w-auto shrink-0 flex items-center justify-center`}>
        <img
          src="/learninghub/inymart-logo.png"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.tried) {
              target.dataset.tried = 'true';
              target.src = '/inymart-logo.png';
            }
          }}
          alt="Inymart Academy - The Branding Fox"
          className={`${sizeClasses[size] || 'h-16 max-w-[240px]'} w-auto object-contain transition-all`}
        />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
