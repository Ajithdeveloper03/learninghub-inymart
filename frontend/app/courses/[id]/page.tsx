import React from 'react';
import CourseDetailsClient from './CourseDetailsClient';

// Pre-generate static IDs for static HTML export
export async function generateStaticParams() {
  return Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CourseDetailsClient initialId={resolvedParams.id} />;
}
