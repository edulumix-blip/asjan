'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ExternalApiPanel = dynamic(
  () => import('@/views/superadmin/ExternalApiPanel'),
  { ssr: false }
);

export default function ExternalApiPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <ExternalApiPanel />
    </Suspense>
  );
}
