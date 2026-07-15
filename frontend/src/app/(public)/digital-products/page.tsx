import type { Metadata } from 'next';
import { Suspense } from 'react';
import DigitalProducts from '@/views/DigitalProducts';

export const metadata: Metadata = {
  title: 'Digital Products - OTT Subscriptions, Software & Tools | EduLumix',
  description: 'Browse affordable digital products including OTT subscriptions, software tools, design resources, and productivity applications at the best prices.',
  keywords: 'digital products, OTT subscription, software tools, design resources, productivity apps, affordable software',
  openGraph: {
    title: 'Digital Products - OTT Subscriptions, Software & Tools | EduLumix',
    description: 'Browse affordable digital products including OTT subscriptions and software tools.',
    url: 'https://edulumix.in/digital-products',
    siteName: 'EduLumix',
    type: 'website',
  },
  alternates: { canonical: 'https://edulumix.in/digital-products' },
};

export default function DigitalProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <DigitalProducts />
    </Suspense>
  );
}
