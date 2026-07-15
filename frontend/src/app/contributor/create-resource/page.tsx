'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CreateResource = dynamic(
  () => import('@/views/dashboard/CreateResource'),
  { ssr: false }
);

export default function CreateResourcePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CreateResource />
    </Suspense>
  );
}
