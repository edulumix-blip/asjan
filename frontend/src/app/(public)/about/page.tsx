import type { Metadata } from 'next';
import { Suspense } from 'react';
import About from '@/views/About';

export const metadata: Metadata = {
  title: 'About Us - EduLumix | Career & Education Platform for Freshers',
  description: 'Learn about EduLumix — a comprehensive career and education platform providing jobs, resources, courses, mock tests, and digital products for freshers and students.',
  keywords: 'about EduLumix, career platform, education platform, freshers, students',
  openGraph: {
    title: 'About Us - EduLumix',
    description: 'Learn about EduLumix — a comprehensive career and education platform for freshers.',
    url: 'https://edulumix.in/about',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/about' },
};

export default function AboutPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <About />
    </Suspense>
  );
}
