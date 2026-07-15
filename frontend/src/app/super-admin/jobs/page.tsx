'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const JobManagement = dynamic(
  () => import('@/views/superadmin/JobManagement'),
  { ssr: false }
);

export default function JobManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <JobManagement />
    </Suspense>
  );
}
