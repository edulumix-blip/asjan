import { Controller, Get, Header } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppService } from './app.service';
import { Blog, BlogDocument } from './blogs/schemas/blog.schema';
import { Job, JobDocument } from './jobs/schemas/job.schema';
import {
  Resource,
  ResourceDocument,
} from './resources/schemas/resource.schema';
import { Course, CourseDocument } from './courses/schemas/course.schema';
import {
  MockTest,
  MockTestDocument,
} from './mocktests/schemas/mocktest.schema';
import {
  DigitalProduct,
  DigitalProductDocument,
} from './products/schemas/product.schema';

const BASE = 'https://edulumix.in';

const STATIC_PAGES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/jobs', changefreq: 'daily', priority: '0.9' },
  { loc: '/resources', changefreq: 'daily', priority: '0.9' },
  { loc: '/blog', changefreq: 'daily', priority: '0.9' },
  { loc: '/courses', changefreq: 'weekly', priority: '0.8' },
  { loc: '/mock-test', changefreq: 'weekly', priority: '0.8' },
  { loc: '/digital-products', changefreq: 'weekly', priority: '0.7' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms-of-service', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookie-policy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/refund-policy', changefreq: 'yearly', priority: '0.3' },
];

function toW3C(date?: any) {
  return date
    ? new Date(date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
}

function escapeXml(str: string) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(MockTest.name)
    private readonly mockTestModel: Model<MockTestDocument>,
    @InjectModel(DigitalProduct.name)
    private readonly productModel: Model<DigitalProductDocument>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  async getSitemap() {
    const [blogs, jobs, resources, courses, mockTests, products] =
      await Promise.all([
        this.blogModel
          .find(
            { isPublished: true, isDeleted: { $ne: true } },
            'slug updatedAt',
          )
          .lean()
          .exec(),
        this.jobModel
          .find({ status: 'Open', isDeleted: { $ne: true } }, '_id updatedAt')
          .lean()
          .exec(),
        this.resourceModel
          .find({ isDeleted: { $ne: true } }, '_id updatedAt')
          .lean()
          .exec(),
        this.courseModel
          .find({ isPublished: true }, 'slug updatedAt')
          .lean()
          .exec(),
        this.mockTestModel
          .find({ isPublished: true }, 'slug updatedAt')
          .lean()
          .exec(),
        this.productModel
          .find({ isAvailable: true }, '_id updatedAt')
          .lean()
          .exec(),
      ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const p of STATIC_PAGES) {
      xml += `  <url>\n    <loc>${BASE}${p.loc}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    }

    // Blogs
    for (const b of blogs) {
      if (!b.slug) continue;
      xml += `  <url>\n    <loc>${BASE}/blog/${escapeXml(b.slug)}</loc>\n    <lastmod>${toW3C((b as any).updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Jobs
    for (const j of jobs) {
      xml += `  <url>\n    <loc>${BASE}/jobs/${j._id}</loc>\n    <lastmod>${toW3C((j as any).updatedAt)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Resources
    for (const r of resources) {
      xml += `  <url>\n    <loc>${BASE}/resources/${r._id}</loc>\n    <lastmod>${toW3C((r as any).updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    // Courses
    for (const c of courses) {
      if (!c.slug) continue;
      xml += `  <url>\n    <loc>${BASE}/courses/${escapeXml(c.slug)}</loc>\n    <lastmod>${toW3C((c as any).updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Mock Tests
    for (const m of mockTests) {
      if (!m.slug) continue;
      xml += `  <url>\n    <loc>${BASE}/mock-test/${escapeXml(m.slug)}</loc>\n    <lastmod>${toW3C((m as any).updatedAt)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    // Digital Products
    for (const p of products) {
      xml += `  <url>\n    <loc>${BASE}/digital-products/${p._id}</loc>\n    <lastmod>${toW3C((p as any).updatedAt)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }
}
