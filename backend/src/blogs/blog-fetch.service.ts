import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import Parser from 'rss-parser';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { UsersService } from '../users/users.service';
import { delay } from '../utils/delay';
import { SyncLogsService } from '../sync-logs/sync-logs.service';

@Injectable()
export class BlogFetchService implements OnModuleInit {
  private readonly logger = new Logger(BlogFetchService.name);
  private readonly MAX_DESC = 1000;
  private readonly INTERVIEW_KEYWORDS = [
    'interview',
    'coding interview',
    'system design',
    'leetcode',
    'dsa',
    'data structure',
    'algorithm',
    'cracking',
    'faang',
    'placement',
  ];
  private readonly CAREER_KEYWORDS = [
    'career',
    'job hunt',
    'job search',
    'resume',
    'cv ',
    'cover letter',
    'linkedin',
    'salary',
    'negotiat',
    'promotion',
    'freelanc',
    'remote work',
    'soft skill',
    'productivity',
    'self-taught',
  ];
  private readonly TUTORIAL_KEYWORDS = [
    'tutorial',
    'how to ',
    'how-to',
    'build a ',
    'build an ',
    'getting started',
    'beginner',
    'step by step',
    'introduction to',
    'learn ',
    'guide to',
    'complete guide',
    'crash course',
    'from scratch',
    '100 days',
  ];
  private readonly NEWS_KEYWORDS = [
    'release',
    'launched',
    'announcing',
    'announcement',
    'new in ',
    'changelog',
    'version ',
    'open source',
    'news',
    'trend',
    'state of ',
    'survey',
    '2024',
    '2025',
    '2026',
  ];

  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  onModuleInit() {
    const enabled =
      process.env.BLOG_FETCH_CRON_ENABLED !== 'false' &&
      process.env.ENABLE_CRON_JOBS !== 'false';
    if (!enabled) {
      console.log(
        '⏸️  Daily blog fetch cron is disabled (BLOG_FETCH_CRON_ENABLED=false or ENABLE_CRON_JOBS=false)',
      );
      return;
    }

    const schedule = process.env.BLOG_FETCH_CRON_SCHEDULE || '0 4 * * *';
    const timezone = process.env.BLOG_FETCH_CRON_TIMEZONE || 'Asia/Kolkata';

    try {
      const job = new CronJob(
        schedule,
        async () => {
          console.log('📥 [Cron] Daily blog fetch started...');
          const startTime = Date.now();
          try {
            const result = await this.runExternalBlogFetch();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(
              `📥 [Cron] Blog fetch completed in ${elapsed}s: created=${result.created}, skipped=${result.skipped}`,
            );
          } catch (err: any) {
            console.error('❌ [Cron] Blog fetch failed:', err.message);
          }
        },
        null,
        false,
        timezone,
      );

      this.schedulerRegistry.addCronJob('daily-blog-fetch', job);
      job.start();
      console.log(`⏰ Blog fetch cron: daily at (${schedule}) - ${timezone}`);
    } catch (e: any) {
      console.warn(
        '⚠️  Invalid BLOG_FETCH_CRON_SCHEDULE:',
        schedule,
        '- cron not started',
        e.message,
      );
    }
  }

  private truncate(s: string, max = this.MAX_DESC): string {
    if (!s || typeof s !== 'string') return '';
    const clean = String(s)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length <= max ? clean : clean.slice(0, max - 3) + '...';
  }

  private extractFirstImage(html: string): string {
    if (!html || typeof html !== 'string') return '';
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1].trim() : '';
  }

  private mapTagsToCategory(
    tags: string[] = [],
    title = '',
    description = '',
  ): string {
    const text = (title + ' ' + description).toLowerCase();
    if (this.INTERVIEW_KEYWORDS.some((k) => text.includes(k)))
      return 'Interview Guide';
    if (this.CAREER_KEYWORDS.some((k) => text.includes(k)))
      return 'Career Tips';
    if (this.TUTORIAL_KEYWORDS.some((k) => text.includes(k))) return 'Tutorial';
    if (this.NEWS_KEYWORDS.some((k) => text.includes(k))) return 'News';
    return 'Tech Blog';
  }

  async fetchFromDevToForBlog(perPage = 25): Promise<any[]> {
    const url = `https://dev.to/api/articles?per_page=${perPage}&page=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Dev.to API error: ${res.status}`);

    const articles = await res.json();
    const items: any[] = [];

    for (const a of articles || []) {
      const coverImage = a.cover_image || a.social_image || '';
      items.push({
        externalId: String(a.id),
        source: 'devto',
        title: (a.title || '').trim().slice(0, 200) || 'Untitled',
        description: this.truncate(a.description || a.title),
        link: a.url || a.canonical_url || '',
        coverImage,
        tags: Array.isArray(a.tag_list) ? a.tag_list : [],
        subcategory: 'Dev.to',
      });
    }
    return items;
  }

  async fetchFromMediumForBlog(limit = 25): Promise<any[]> {
    const parser = new Parser();
    const tags = [
      'javascript',
      'programming',
      'web-development',
      'software-development',
      'react',
      'python',
    ];
    const seen = new Set<string>();
    const items: any[] = [];

    for (const tag of tags) {
      if (items.length >= limit) break;
      await delay(150);
      try {
        const feed = await parser.parseURL(
          `https://medium.com/feed/tag/${tag}`,
        );
        for (const item of feed?.items || []) {
          const guid = item.guid || item.link;
          if (!guid || seen.has(guid)) continue;
          seen.add(guid);
          const link = item.link || item.guid || '';
          if (!link || !item.title) continue;

          let coverImage = item.enclosure?.url || item.thumbnail || '';
          if (!coverImage && item.content) {
            coverImage = this.extractFirstImage(item.content);
          }

          items.push({
            externalId: (guid || link).slice(0, 200),
            source: 'medium',
            title: (item.title || '').trim().slice(0, 200) || 'Untitled',
            description: this.truncate(
              item.contentSnippet || item.content || item.title,
            ),
            link,
            coverImage,
            subcategory: 'Medium',
          });
          if (items.length >= limit) return items;
        }
      } catch (err: any) {
        this.logger.warn(`Error in fetchFromMediumForBlog for tag ${tag}: ${err.message}`);
      }
    }
    return items;
  }

  async runExternalBlogFetch(opts: any = {}, syncLogId?: string) {
    try {
      const superAdminDoc = await this.usersService.findSuperAdmin();

      if (!superAdminDoc) {
        const errorMsg = 'Super Admin user not found. Please register super admin first.';
        if (syncLogId) {
          await this.syncLogsService.updateLogFailure(syncLogId, errorMsg);
        }
        throw new Error(errorMsg);
      }

    const { devToPerPage = 25, mediumLimit = 25 } = opts;
    const results = {
      devto: [] as any[],
      medium: [] as any[],
      errors: [] as any[],
    };

    try {
      results.devto = await this.fetchFromDevToForBlog(devToPerPage);
    } catch (e: any) {
      this.logger.error(`Error fetching blogs from Dev.to: ${e.message}`, e.stack);
      results.errors.push({ source: 'devto', message: e.message });
    }

    try {
      results.medium = await this.fetchFromMediumForBlog(mediumLimit);
    } catch (e: any) {
      this.logger.error(`Error fetching blogs from Medium: ${e.message}`, e.stack);
      results.errors.push({ source: 'medium', message: e.message });
    }

    const all = [...results.devto, ...results.medium];

    let created = 0;
    let skipped = 0;

    for (const raw of all) {
      const exists = await this.blogModel
        .findOne({ source: raw.source, externalId: raw.externalId })
        .exec();
      if (exists) {
        skipped++;
        continue;
      }
      if (!raw.link || !raw.title) continue;

      const content =
        (raw.description || raw.title) +
        `\n\n**Read full article:** [${raw.link}](${raw.link})`;
      const category = this.mapTagsToCategory(
        raw.tags || [],
        raw.title,
        raw.description || '',
      );

      await this.blogModel.create({
        title: raw.title.slice(0, 200),
        content,
        excerpt: (raw.description || raw.title).slice(0, 300),
        shortDescription: (raw.description || raw.title).slice(0, 500),
        category,
        coverImage: raw.coverImage || '',
        tags: [raw.subcategory].filter(Boolean),
        author: superAdminDoc._id,
        isPublished: true,
        source: raw.source,
        externalId: raw.externalId,
        externalLink: raw.link,
      });
      created++;
    }

      const finalStats = {
        created,
        skipped,
        totalFetched: all.length,
      };

      if (syncLogId) {
        await this.syncLogsService.updateLogSuccess(syncLogId, finalStats, results.errors);
      }

      return {
        ...finalStats,
        errors: results.errors,
      };
    } catch (error: any) {
      this.logger.error(`Error in runExternalBlogFetch: ${error.message}`, error.stack);
      if (syncLogId) {
        await this.syncLogsService.updateLogFailure(syncLogId, error);
      }
      throw error;
    }
  }

  async deleteFetchedBlogs() {
    const result = await this.blogModel
      .deleteMany({ source: { $in: ['devto', 'medium'] } })
      .exec();
    return { deleted: result.deletedCount };
  }
}
