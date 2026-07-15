'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ResourceManagement = dynamic(
  () => import('@/views/superadmin/ResourceManagement'),
  { ssr: false }
);

export default function ResourceManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ResourceManagement />
    </Suspense>
  );
}
