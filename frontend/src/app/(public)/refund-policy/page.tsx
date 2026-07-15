import type { Metadata } from 'next';
import { Suspense } from 'react';
import RefundPolicy from '@/views/RefundPolicy';

export const metadata: Metadata = {
  title: 'Refund Policy - EduLumix',
  description: 'Read the EduLumix refund policy. Understand the terms, conditions, and eligibility for refunds on our digital products.',
  alternates: { canonical: 'https://edulumix.in/refund-policy' },
};

export default function RefundPolicyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <RefundPolicy />
    </Suspense>
  );
}
