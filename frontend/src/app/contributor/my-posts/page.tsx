'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ContributorMyPosts = dynamic(
  () => import('@/views/contributor/ContributorMyPosts'),
  { ssr: false }
);

export default function ContributorMyPostsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ContributorMyPosts />
    </Suspense>
  );
}
