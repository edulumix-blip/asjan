import type { Metadata } from 'next';
import { Suspense } from 'react';
import DigitalProductDetails from '@/views/DigitalProductDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const product = json.data;
    const title = `${product.name} | Digital Products | EduLumix`;
    const description = product.description || `Buy ${product.name} at the best price on EduLumix. ${product.category || 'Digital'} product.`;
    return {
      title,
      description,
      keywords: `${product.name}, ${product.category || 'digital product'}, buy online, EduLumix`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/digital-products/${id}`,
        siteName: 'EduLumix',
        type: 'article',
        ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
      },
      alternates: { canonical: `https://edulumix.in/digital-products/${id}` },
    };
  } catch {
    return { title: 'Digital Product | EduLumix', description: 'Browse digital products on EduLumix.' };
  }
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <DigitalProductDetails />
    </Suspense>
  );
}
