import type { Metadata } from 'next';
import { Suspense } from 'react';
import Courses from '@/views/Courses';

export const metadata: Metadata = {
  title: 'Free Online Courses - Programming, Web Dev, AI & More | EduLumix',
  description: 'Explore free online courses in programming, web development, AI & machine learning, data science, and more. Curated learning paths for students and freshers.',
  keywords: 'free online courses, programming courses, web development course, AI course, data science, machine learning',
  openGraph: {
    title: 'Free Online Courses - Programming, Web Dev, AI & More | EduLumix',
    description: 'Explore free online courses curated for students and freshers.',
    url: 'https://edulumix.in/courses',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/courses' },
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Courses />
    </Suspense>
  );
}
