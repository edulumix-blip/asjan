import type { Metadata } from 'next';
import { Suspense } from 'react';
import Resources from '@/views/Resources';

export const metadata: Metadata = {
  title: 'Free Learning Resources - Notes, Tools, Projects & Videos | EduLumix',
  description: 'Access free learning resources including software notes, interview preparation notes, tools & technology guides, trending tech resources, video tutorials, and project ideas.',
  keywords: 'free resources, software notes, interview notes, tools, trending technology, video resources, software project, hardware project',
  openGraph: {
    title: 'Free Learning Resources - Notes, Tools, Projects & Videos | EduLumix',
    description: 'Access free learning resources including notes, tools, tutorials, and project ideas for students and freshers.',
    url: 'https://edulumix.in/resources',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/resources' },
};

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Resources />
    </Suspense>
  );
}
