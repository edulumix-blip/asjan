'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const MockTestManagement = dynamic(
  () => import('@/views/superadmin/MockTestManagement'),
  { ssr: false }
);

export default function MockTestManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <MockTestManagement />
    </Suspense>
  );
}
