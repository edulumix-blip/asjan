'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const SuperAdminProfile = dynamic(
  () => import('@/views/superadmin/SuperAdminProfile'),
  { ssr: false }
);

export default function SuperAdminProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <SuperAdminProfile />
    </Suspense>
  );
}
