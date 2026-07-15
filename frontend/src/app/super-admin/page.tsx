'use client';
import { Suspense } from 'react';

import SuperAdminDashboard from '@/views/superadmin/SuperAdminDashboard';

export default function SuperAdminDashboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <SuperAdminDashboard />
    </Suspense>
  );
}
