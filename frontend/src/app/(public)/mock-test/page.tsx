import type { Metadata } from 'next';
import { Suspense } from 'react';
import MockTests from '@/views/MockTests';

export const metadata: Metadata = {
  title: 'Free Mock Tests for Placement, GATE & Competitive Exams | EduLumix',
  description: 'Practice free mock tests for campus placement, GATE CS, aptitude, logical reasoning, DSA, DBMS, OS, and competitive exams. Get instant results with detailed explanations.',
  keywords: 'mock test, free mock test, placement mock test, GATE mock test, aptitude test, DSA practice, competitive exam preparation',
  openGraph: {
    title: 'Free Mock Tests for Placement, GATE & Competitive Exams | EduLumix',
    description: 'Practice free mock tests for campus placement, GATE CS, aptitude, logical reasoning, and competitive exams with instant results.',
    url: 'https://edulumix.in/mock-test',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: {
    canonical: 'https://edulumix.in/mock-test',
  },
};

export default function MockTestsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <MockTests />
    </Suspense>
  );
}
