import { MetadataRoute } from 'next';

interface HasSlugAndDate {
  slug: string;
  updatedAt?: string | Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://edulumix.in';
  
  // Server-side backend API URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
  
  let jobs: HasSlugAndDate[] = [];
  let blogs: HasSlugAndDate[] = [];
  let courses: HasSlugAndDate[] = [];
  let resources: HasSlugAndDate[] = [];
  let mockTests: HasSlugAndDate[] = [];
  let products: HasSlugAndDate[] = [];

  try {
    const [jobsRes, blogsRes, coursesRes, resourcesRes, mockTestsRes, productsRes] = await Promise.all([
      fetch(`${backendUrl}/api/jobs`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${backendUrl}/api/blogs`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${backendUrl}/api/courses`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${backendUrl}/api/resources`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${backendUrl}/api/mock-test`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${backendUrl}/api/digital-products`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    jobs = jobsRes.data || [];
    blogs = blogsRes.data || [];
    courses = coursesRes.data || [];
    resources = resourcesRes.data || [];
    mockTests = mockTestsRes.data || [];
    products = productsRes.data || [];
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
  }

  const today = new Date();

  const staticUrls = [
    { url: '', changefreq: 'daily', priority: 1.0 },
    { url: '/jobs', changefreq: 'hourly', priority: 0.95 },
    { url: '/resources', changefreq: 'daily', priority: 0.9 },
    { url: '/courses', changefreq: 'weekly', priority: 0.9 },
    { url: '/blog', changefreq: 'daily', priority: 0.9 },
    { url: '/mock-test', changefreq: 'weekly', priority: 0.85 },
    { url: '/digital-products', changefreq: 'weekly', priority: 0.85 },
    { url: '/interview-prep', changefreq: 'weekly', priority: 0.85 },
    { url: '/resume-analyzer', changefreq: 'weekly', priority: 0.85 },
    { url: '/about', changefreq: 'monthly', priority: 0.6 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 },
    { url: '/terms-of-service', changefreq: 'yearly', priority: 0.3 },
    { url: '/refund-policy', changefreq: 'yearly', priority: 0.3 },
    { url: '/cookie-policy', changefreq: 'yearly', priority: 0.3 },
  ].map(p => ({
    url: `${baseUrl}${p.url}`,
    lastModified: today,
    changeFrequency: p.changefreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority: p.priority,
  }));

  const jobUrls = Array.isArray(jobs) ? jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt ? new Date(job.updatedAt) : today,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  })) : [];

  const blogUrls = Array.isArray(blogs) ? blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.updatedAt ? new Date(blog.updatedAt) : today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) : [];

  const courseUrls = Array.isArray(courses) ? courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt ? new Date(course.updatedAt) : today,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) : [];

  const resourceUrls = Array.isArray(resources) ? resources.map((res) => ({
    url: `${baseUrl}/resources/${res.slug}`,
    lastModified: res.updatedAt ? new Date(res.updatedAt) : today,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) : [];

  const mockTestUrls = Array.isArray(mockTests) ? mockTests.map((test) => ({
    url: `${baseUrl}/mock-test/${test.slug}`,
    lastModified: test.updatedAt ? new Date(test.updatedAt) : today,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) : [];

  const productUrls = Array.isArray(products) ? products.map((product) => ({
    url: `${baseUrl}/digital-products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : today,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) : [];

  return [
    ...staticUrls,
    ...jobUrls,
    ...blogUrls,
    ...courseUrls,
    ...resourceUrls,
    ...mockTestUrls,
    ...productUrls
  ];
}
