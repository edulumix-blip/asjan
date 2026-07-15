import type { Metadata } from 'next';
import { Suspense } from 'react';
import CookiePolicy from '@/views/CookiePolicy';

export const metadata: Metadata = {
  title: 'Cookie Policy - EduLumix',
  description: 'Read the EduLumix cookie policy. Learn how we use cookies and tracking technologies to improve your experience.',
  alternates: { canonical: 'https://edulumix.in/cookie-policy' },
};

export default function CookiePolicyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <CookiePolicy />
    </Suspense>
  );
}
