import type { Metadata } from 'next';
import { Suspense } from 'react';
import Blog from '@/views/Blog';

export const metadata: Metadata = {
  title: 'Tech Blogs - Career Tips, Tutorials, Interview Guides & Trending News | EduLumix',
  description: 'Read the latest tech blogs, career tips, interview guides, coding tutorials, and trending technology news. Stay updated with AI, web development, DevOps and more.',
  keywords: 'tech blogs, career tips, interview guide, coding tutorial, trending tech news, AI, web development, DevOps',
  openGraph: {
    title: 'Tech Blogs - Career Tips, Tutorials & Trending News | EduLumix',
    description: 'Read the latest tech blogs, career tips, interview guides, and trending technology news.',
    url: 'https://edulumix.in/blog',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/blog' },
};

export default function BlogsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Blog />
    </Suspense>
  );
}
