import type { Metadata } from 'next';
import { Suspense } from 'react';
import Jobs from '@/views/Jobs';

export const metadata: Metadata = {
  title: 'Fresher Jobs - IT, Non-IT, Govt, Internship & Remote Opportunities | EduLumix',
  description: 'Find the latest fresher jobs including IT jobs, non-IT jobs, government jobs, internships, walk-in drives, part-time and remote job opportunities. Updated daily.',
  keywords: 'fresher jobs, IT jobs, non-IT jobs, government jobs, internships, walk-in drive, remote jobs, part time jobs, entry level jobs',
  openGraph: {
    title: 'Fresher Jobs - IT, Non-IT, Govt, Internship & Remote Opportunities | EduLumix',
    description: 'Find the latest fresher jobs including IT, non-IT, government, internship and remote opportunities. Updated daily.',
    url: 'https://edulumix.in/jobs',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/jobs' },
};

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Jobs />
    </Suspense>
  );
}
