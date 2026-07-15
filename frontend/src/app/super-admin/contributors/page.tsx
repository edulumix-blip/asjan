'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContributorManagement = dynamic(
  () => import('@/views/superadmin/ContributorManagement'),
  { ssr: false }
);

export default function ContributorManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ContributorManagement />
    </Suspense>
  );
}
