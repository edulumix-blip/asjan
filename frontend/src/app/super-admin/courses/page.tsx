'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CourseManagement = dynamic(
  () => import('@/views/superadmin/CourseManagement'),
  { ssr: false }
);

export default function CourseManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CourseManagement />
    </Suspense>
  );
}
