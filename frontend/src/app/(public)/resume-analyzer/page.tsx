import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResumeAnalyzer from '@/views/ResumeAnalyzer';

export const metadata: Metadata = {
  title: 'AI Resume Analyzer & ATS Score Grader | EduLumix',
  description: 'Evaluate your resume instantly with our AI ATS analyzer. Get your ATS compatibility score, formatting feedback, keyword suggestions, and matched fresher jobs.',
  keywords: 'resume analyzer, ats checker, resume grader, free cv review, resume match, fresher jobs matching',
  openGraph: {
    title: 'AI Resume Analyzer & ATS Score Grader | EduLumix',
    description: 'Optimize your resume, get detailed keyword reports, and find matches for fresher jobs.',
    url: 'https://edulumix.in/resume-analyzer',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: {
    canonical: 'https://edulumix.in/resume-analyzer',
  },
};

export default function ResumeAnalyzerPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ResumeAnalyzer />
    </Suspense>
  );
}
