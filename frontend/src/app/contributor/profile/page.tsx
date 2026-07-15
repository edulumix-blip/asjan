'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContributorProfile = dynamic(
  () => import('@/views/contributor/ContributorProfile'),
  { ssr: false }
);

export default function ContributorProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ContributorProfile />
    </Suspense>
  );
}
