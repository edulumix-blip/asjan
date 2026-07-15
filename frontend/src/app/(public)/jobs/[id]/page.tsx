import type { Metadata } from 'next';
import { Suspense } from 'react';
import JobDetails from '@/views/JobDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/jobs/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const job = json.data;
    const title = `${job.title} at ${job.company} | Fresher Jobs | EduLumix`;
    const description = `Apply for ${job.title} at ${job.company}, ${job.location}. ${job.category} opportunity for ${job.experience || 'Fresher'} candidates.`;
    return {
      title,
      description,
      keywords: `${job.title}, ${job.company}, ${job.category}, fresher job, ${job.location}`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/jobs/${id}`,
        siteName: 'EduLumix',
        type: 'article',
      },
      alternates: { canonical: `https://edulumix.in/jobs/${id}` },
    };
  } catch {
    return { title: 'Job Details | EduLumix', description: 'View job details and apply on EduLumix.' };
  }
}

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <JobDetails />
    </Suspense>
  );
}
