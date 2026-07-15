import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogDetails from '@/views/BlogDetails';

const API_BASE = process.env.INTERNAL_API_URL || 'http://127.0.0.1:5001/api';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/blogs/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('Not found');
    const json = await res.json();
    const blog = json.data;
    const title = `${blog.title} | EduLumix Blog`;
    const description = blog.excerpt || blog.shortDescription || `Read ${blog.title} on EduLumix. ${blog.category} article.`;
    return {
      title,
      description,
      keywords: `${blog.category}, ${blog.tags?.join(', ') || ''}, tech blog, EduLumix`,
      openGraph: {
        title,
        description,
        url: `https://edulumix.in/blog/${slug}`,
        siteName: 'EduLumix',
        type: 'article',
        ...(blog.coverImage ? { images: [{ url: blog.coverImage }] } : {}),
      },
      alternates: { canonical: `https://edulumix.in/blog/${slug}` },
    };
  } catch {
    return { title: 'Blog | EduLumix', description: 'Read tech blogs and career tips on EduLumix.' };
  }
}

export default function BlogDetailsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[40vh]">Loading...</div>}>
      <BlogDetails />
    </Suspense>
  );
}
