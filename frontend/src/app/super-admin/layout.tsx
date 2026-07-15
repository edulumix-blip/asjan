'use client';

import React from 'react';
import SuperAdminLayout from '@/views/superadmin/SuperAdminLayout';
import { OutletProvider } from '@/utils/reactRouterCompat';

export default function SuperAdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OutletProvider value={children}>
      <SuperAdminLayout />
    </OutletProvider>
  );
}
