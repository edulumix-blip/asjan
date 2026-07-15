import type { Metadata } from 'next';
import { Suspense } from 'react';
import CourseDetails from '@/views/CourseDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/courses/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const course = json.data;
    const title = `${course.title} | Free Course | EduLumix`;
    const description = course.description || `Learn ${course.title} for free on EduLumix. ${course.category || 'Online'} course for students and freshers.`;
    return {
      title,
      description,
      keywords: `${course.title}, free course, ${course.category || 'online learning'}, EduLumix`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/courses/${slug}`,
        siteName: 'EduLumix',
        type: 'article',
        ...(course.thumbnail ? { images: [{ url: course.thumbnail }] } : {}),
      },
      alternates: { canonical: `https://edulumix.in/courses/${slug}` },
    };
  } catch {
    return { title: 'Course | EduLumix', description: 'Learn free courses on EduLumix.' };
  }
}

export default function CourseDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CourseDetails />
    </Suspense>
  );
}
