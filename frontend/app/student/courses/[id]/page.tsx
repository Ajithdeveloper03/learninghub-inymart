import React from 'react';
import StudentCourseClient from './StudentCourseClient';

// Pre-generate static IDs for static HTML export
export async function generateStaticParams() {
  return Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function StudentCourseWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <StudentCourseClient initialId={resolvedParams.id} />;
}
