import type { Metadata } from 'next';
import { Suspense } from 'react';
import Login from '@/views/auth/Login';

export const metadata: Metadata = {
  title: 'Login - EduLumix',
  description: 'Log in to your EduLumix account to access jobs, resources, courses, mock tests, and more.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <Login />
    </Suspense>
  );
}
