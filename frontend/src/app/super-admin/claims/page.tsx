'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ClaimsManagement = dynamic(
  () => import('@/views/superadmin/ClaimsManagement'),
  { ssr: false }
);

export default function ClaimsManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ClaimsManagement />
    </Suspense>
  );
}
