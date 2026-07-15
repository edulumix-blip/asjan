import type { Metadata } from 'next';
import { Suspense } from 'react';
import Signup from '@/views/auth/Signup';

export const metadata: Metadata = {
  title: 'Sign Up - EduLumix',
  description: 'Create your EduLumix account to access jobs, resources, courses, mock tests, and start your career journey.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Signup />
    </Suspense>
  );
}
