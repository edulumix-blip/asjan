import type { Metadata } from 'next';
import { Suspense } from 'react';
import MockTestDetails from '@/views/MockTestDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/mocktests/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const test = json.data;
    const title = `${test.title} | Mock Test | EduLumix`;
    const description = test.description || `Take the ${test.title} mock test on EduLumix. Free practice test for ${test.category} exam preparation.`;
    return {
      title,
      description,
      keywords: `${test.category}, mock test, ${test.title}, practice test, exam preparation`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/mock-test/${slug}`,
        siteName: 'EduLumix',
        type: 'article',
        ...(test.thumbnail ? { images: [{ url: test.thumbnail }] } : {}),
      },
      alternates: { canonical: `https://edulumix.in/mock-test/${slug}` },
    };
  } catch {
    return { title: 'Mock Test | EduLumix', description: 'Take free mock tests on EduLumix.' };
  }
}

export default function MockTestDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <MockTestDetails />
    </Suspense>
  );
}
