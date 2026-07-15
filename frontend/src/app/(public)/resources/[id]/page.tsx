import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResourceDetails from '@/views/ResourceDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/resources/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const resource = json.data;
    const title = `${resource.title} | ${resource.category} | EduLumix Resources`;
    const description = resource.description || `Free ${resource.category} resource: ${resource.title}. Download or access on EduLumix.`;
    return {
      title,
      description,
      keywords: `${resource.category}, ${resource.title}, free resource, learning material`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/resources/${id}`,
        siteName: 'EduLumix',
        type: 'article',
        ...(resource.thumbnail ? { images: [{ url: resource.thumbnail }] } : {}),
      },
      alternates: { canonical: `https://edulumix.in/resources/${id}` },
    };
  } catch {
    return { title: 'Resource | EduLumix', description: 'Access free learning resources on EduLumix.' };
  }
}

export default function ResourceDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ResourceDetails />
    </Suspense>
  );
}
