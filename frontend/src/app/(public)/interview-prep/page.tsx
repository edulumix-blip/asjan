import type { Metadata } from 'next';
import { Suspense } from 'react';
import InterviewPrep from '@/views/InterviewPrep';

export const metadata: Metadata = {
  title: 'AI Interview Prep Center & Mock Simulator | EduLumix',
  description: 'Ace your next tech interview with EduLumix. Practice top coding and behavioral questions, track your readiness progress, and get rated on our AI mock interview simulator.',
  keywords: 'interview prep, mock interview, tech interview questions, react interview, node.js interview, sql questions, star method',
  openGraph: {
    title: 'AI Interview Prep Center & Mock Simulator | EduLumix',
    description: 'Practice curated tech questions and simulate real interview rounds with instant feedback.',
    url: 'https://edulumix.in/interview-prep',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: {
    canonical: 'https://edulumix.in/interview-prep',
  },
};

export default function InterviewPrepPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <InterviewPrep />
    </Suspense>
  );
}
