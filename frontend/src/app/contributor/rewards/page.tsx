'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContributorRewards = dynamic(
  () => import('@/views/contributor/ContributorRewards'),
  { ssr: false }
);

export default function ContributorRewardsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ContributorRewards />
    </Suspense>
  );
}
