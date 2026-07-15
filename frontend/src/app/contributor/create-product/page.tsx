'use client';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CreateProduct = dynamic(
  () => import('@/views/dashboard/CreateProduct'),
  { ssr: false }
);

export default function CreateProductPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CreateProduct />
    </Suspense>
  );
}
