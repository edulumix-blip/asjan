import type { Metadata } from 'next';
import { Suspense } from 'react';
import PrivacyPolicy from '@/views/PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Privacy Policy - EduLumix',
  description: 'Read the EduLumix privacy policy. Learn how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://edulumix.in/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <PrivacyPolicy />
    </Suspense>
  );
}
