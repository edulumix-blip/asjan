import type { Metadata } from 'next';
import { Suspense } from 'react';
import PendingApproval from '@/views/auth/PendingApproval';

export const metadata: Metadata = {
  title: 'Account Approval Pending - EduLumix',
  description: 'Your EduLumix account registration is pending admin approval. You will be notified once approved.',
  robots: { index: false, follow: false },
};

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <PendingApproval />
    </Suspense>
  );
}
