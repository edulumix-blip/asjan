'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const BlogManagement = dynamic(
  () => import('@/views/superadmin/BlogManagement'),
  { ssr: false }
);

export default function BlogManagementPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <BlogManagement />
    </Suspense>
  );
}
