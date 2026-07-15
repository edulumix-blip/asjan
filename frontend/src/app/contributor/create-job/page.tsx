'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CreateJob = dynamic(
  () => import('@/views/dashboard/CreateJob'),
  { ssr: false }
);

export default function CreateJobPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CreateJob />
    </Suspense>
  );
}
