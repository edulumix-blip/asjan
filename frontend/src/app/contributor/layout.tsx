'use client';

import React from 'react';
import ContributorLayout from '@/views/contributor/ContributorLayout';
import { OutletProvider } from '@/utils/reactRouterCompat';

export default function ContributorLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OutletProvider value={children}>
      <ContributorLayout />
    </OutletProvider>
  );
}
