'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CreateBlog = dynamic(
  () => import('@/views/dashboard/CreateBlog'),
  { ssr: false }
);

export default function CreateBlogPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CreateBlog />
    </Suspense>
  );
}
