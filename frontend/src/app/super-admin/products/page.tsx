'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DigitalProductManagement = dynamic(
  () => import('@/views/superadmin/DigitalProductManagement'),
  { ssr: false }
);

export default function DigitalProductManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <DigitalProductManagement />
    </Suspense>
  );
}
