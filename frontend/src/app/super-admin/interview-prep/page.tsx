'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const InterviewPrepManagement = dynamic(
  () => import('@/views/superadmin/InterviewPrepManagement'),
  { ssr: false }
);

export default function InterviewPrepManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <InterviewPrepManagement />
    </Suspense>
  );
}
