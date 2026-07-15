import type { Metadata } from 'next';
import { Suspense } from 'react';
import TermsOfService from '@/views/TermsOfService';

export const metadata: Metadata = {
  title: 'Terms of Service - EduLumix',
  description: 'Read the EduLumix terms of service. Understand the rules and guidelines for using our platform.',
  alternates: { canonical: 'https://edulumix.in/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <TermsOfService />
    </Suspense>
  );
}
