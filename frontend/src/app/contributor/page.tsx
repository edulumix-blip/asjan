'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContributorDashboard = dynamic(
  () => import('@/views/contributor/ContributorDashboard'),
  { ssr: false }
);

export default function ContributorDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ContributorDashboard />
    </Suspense>
  );
}
