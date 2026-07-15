import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import Parser from 'rss-parser';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { UsersService } from '../users/users.service';
import { delay } from '../utils/delay';
import { SyncLogsService } from '../sync-logs/sync-logs.service';

@Injectable()
export class ResourceFetchService implements OnModuleInit {
  private readonly logger = new Logger(ResourceFetchService.name);
  private readonly MAX_DESC = 1000;

  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  onModuleInit() {
    const enabled =
      process.env.RESOURCE_FETCH_CRON_ENABLED !== 'false' &&
      process.env.ENABLE_CRON_JOBS !== 'false';
    if (!enabled) {
      console.log(
        '⏸️  Daily resource fetch cron is disabled (RESOURCE_FETCH_CRON_ENABLED=false or ENABLE_CRON_JOBS=false)',
      );
      return;
    }

    const schedule = process.env.RESOURCE_FETCH_CRON_SCHEDULE || '25 3 * * *';
    const timezone = process.env.RESOURCE_FETCH_CRON_TIMEZONE || 'Asia/Kolkata';

    try {
      const job = new CronJob(
        schedule,
        async () => {
          console.log('📥 [Cron] Daily resource fetch started...');
          const startTime = Date.now();
          try {
            const result = await this.runExternalResourceFetch();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(
              `📥 [Cron] Resource fetch completed in ${elapsed}s: created=${result.created}, skipped=${result.skipped}`,
            );
          } catch (err: any) {
            console.error('❌ [Cron] Resource fetch failed:', err.message);
          }
        },
        null,
        false,
        timezone,
      );

      this.schedulerRegistry.addCronJob('daily-resource-fetch', job);
      job.start();
      console.log(
        `⏰ Resource fetch cron: daily at (${schedule}) - ${timezone}`,
      );
    } catch (e: any) {
      console.warn(
        '⚠️  Invalid RESOURCE_FETCH_CRON_SCHEDULE:',
        schedule,
        '- cron not started',
        e.message,
      );
    }
  }

  private mapCategory(tags: string, title = ''): string {
    const t = `${(tags || '').toLowerCase()} ${(title || '').toLowerCase()}`;
    if (/interview|job|hiring/.test(t)) return 'Interview Notes';
    if (/tool|vscode|api|docker|git/.test(t)) return 'Tools & Technology';
    if (/ai|blockchain|cloud|trend/.test(t)) return 'Trending Technology';
    if (/video|tutorial|course|learn/.test(t)) return 'Video Resources';
    if (/project|portfolio|build/.test(t)) return 'Software Project';
    if (/hardware|iot|arduino/.test(t)) return 'Hardware Project';
    return 'Software Notes';
  }

  private truncate(s: string, max = this.MAX_DESC): string {
    if (!s || typeof s !== 'string') return '';
    const clean = s.replace(/\s+/g, ' ').trim();
    return clean.length <= max ? clean : clean.slice(0, max - 3) + '...';
  }

  async fetchFromDevTo(limit = 400): Promise<any[]> {
    const topics = [
      'javascript',
      'python',
      'webdev',
      'programming',
      'react',
      'node',
      'typescript',
      'css',
      'html',
      'beginners',
      'tutorial',
      'career',
      'productivity',
      'opensource',
      'devops',
      'docker',
      'aws',
      'database',
      'sql',
      'api',
      'git',
      'linux',
      'security',
      'testing',
      'ai',
    ];
    const seen = new Set<string>();
    const resources: any[] = [];
    const perPage = 30;

    for (const tag of topics) {
      if (resources.length >= limit) break;
      for (let page = 1; page <= 3; page++) {
        if (resources.length >= limit) break;
        await delay(150);
        try {
          const url = `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}&page=${page}&state=fresh`;
          const res = await fetch(url);
          if (!res.ok) break;
          const articles = await res.json();
          if (!articles || articles.length === 0) break;

          for (const a of articles) {
            if (resources.length >= limit) break;
            const eid = String(a.id);
            if (seen.has(eid)) continue;
            seen.add(eid);
            const tags = Array.isArray(a.tag_list)
              ? a.tag_list.join(', ')
              : a.tags || '';
            resources.push({
              externalId: eid,
              source: 'devto',
              title: (a.title || '').trim().slice(0, 150) || 'Untitled',
              category: this.mapCategory(tags, a.title),
              subcategory: 'Dev.to',
              link: a.url || a.canonical_url || '',
              description: this.truncate(a.description || a.title),
              thumbnail: a.cover_image || a.social_image || '',
              isVideo: false,
            });
          }
          if (articles.length < perPage) break;
        } catch (err: any) {
          this.logger.error(`Error in fetchFromDevTo for tag ${tag}, page ${page}: ${err.message}`, err.stack);
          break;
        }
      }
    }
    return resources;
  }

  async fetchMyDevToPosts(apiKey: string): Promise<any[]> {
    const resources: any[] = [];
    let page = 1;
    const perPage = 30;

    while (true) {
      const url = `https://dev.to/api/articles/me/published?per_page=${perPage}&page=${page}`;
      const res = await fetch(url, {
        headers: {
          'api-key': apiKey,
          Accept: 'application/vnd.forem.api-v1+json',
        },
      });
      if (!res.ok) throw new Error(`Dev.to personal API error: ${res.status}`);

      const articles = await res.json();
      if (!articles || articles.length === 0) break;

      for (const a of articles) {
        const tags = Array.isArray(a.tag_list)
          ? a.tag_list.join(', ')
          : a.tags || '';
        resources.push({
          externalId: String(a.id),
          source: 'devto',
          title: (a.title || '').trim().slice(0, 150) || 'Untitled',
          category: this.mapCategory(tags, a.title),
          subcategory: 'Dev.to',
          link: a.url || a.canonical_url || '',
          description: this.truncate(a.description || a.title),
          thumbnail: a.cover_image || a.social_image || '',
          isVideo: false,
        });
      }

      if (articles.length < perPage) break;
      page++;
    }

    return resources;
  }

  async fetchFromMedium(limit = 120): Promise<any[]> {
    const parser = new Parser();
    const tags = [
      'javascript',
      'programming',
      'web-development',
      'software-development',
      'react',
      'python',
      'nodejs',
      'typescript',
      'css',
      'html',
      'machine-learning',
      'artificial-intelligence',
      'data-science',
      'cloud-computing',
      'devops',
      'docker',
      'kubernetes',
      'api',
      'database',
      'security',
      'career',
      'productivity',
      'open-source',
      'git',
      'interview',
    ];
    const seen = new Set<string>();
    const resources: any[] = [];

    for (const tag of tags) {
      if (resources.length >= limit) break;
      await delay(150);
      try {
        const feed = await parser.parseURL(
          `https://medium.com/feed/tag/${tag}`,
        );
        const items = feed?.items || [];
        for (const item of items) {
          if (resources.length >= limit) break;
          const guid = item.guid || item.link;
          if (!guid || seen.has(guid)) continue;
          seen.add(guid);
          const link = item.link || item.guid || '';
          if (!link || !item.title) continue;
          resources.push({
            externalId: (guid || link).slice(0, 200),
            source: 'medium',
            title: (item.title || '').trim().slice(0, 150) || 'Untitled',
            category: this.mapCategory(
              item.categories?.join?.() || '',
              item.title,
            ),
            subcategory: 'Medium',
            link,
            description: this.truncate(item.contentSnippet || item.title),
            bodyHtml: typeof item.content === 'string' ? item.content : '',
            thumbnail: item.enclosure?.url || item.thumbnail || '',
            isVideo: false,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Error in fetchFromMedium for tag ${tag}: ${err.message}`);
      }
    }
    return resources;
  }

  async runExternalResourceFetch(opts: any = {}, syncLogId?: string) {
    try {
      const superAdminDoc = await this.usersService.findSuperAdmin();

      if (!superAdminDoc) {
        const errorMsg = 'Super Admin user not found. Please register super admin first.';
        if (syncLogId) {
          await this.syncLogsService.updateLogFailure(syncLogId, errorMsg);
        }
        throw new Error(errorMsg);
      }

    const apiKey = process.env.DEVTO_API_KEY;

    const { devToLimit = 400, mediumLimit = 120 } = opts;
    const results = {
      devto: [] as any[],
      myDevto: [] as any[],
      medium: [] as any[],
      errors: [] as any[],
    };

    try {
      results.devto = await this.fetchFromDevTo(devToLimit);
    } catch (e: any) {
      this.logger.error(`Error fetching from Dev.to public: ${e.message}`, e.stack);
      results.errors.push({ source: 'devto', message: e.message });
    }

    if (apiKey) {
      try {
        results.myDevto = await this.fetchMyDevToPosts(apiKey);
      } catch (e: any) {
        this.logger.error(`Error fetching from personal Dev.to: ${e.message}`, e.stack);
        results.errors.push({ source: 'myDevto', message: e.message });
      }
    }

    try {
      results.medium = await this.fetchFromMedium(mediumLimit);
    } catch (e: any) {
      this.logger.error(`Error fetching from Medium: ${e.message}`, e.stack);
      results.errors.push({ source: 'medium', message: e.message });
    }

    let created = 0;
    let skipped = 0;

    const all = [...results.devto, ...results.myDevto, ...results.medium];

    const syncErrors = [...results.errors];

    for (const raw of all) {
      try {
        const { externalId, source, ...data } = raw;
        if (!data.link || !data.title) continue;

        const dupQuery = externalId
          ? { source, externalId }
          : { link: data.link };

        const exists = await this.resourceModel.findOne(dupQuery).exec();
        if (exists) {
          if (data.bodyHtml && !exists.bodyHtml) {
            await this.resourceModel
              .updateOne(
                { _id: exists._id },
                { $set: { bodyHtml: data.bodyHtml } },
              )
              .exec();
          }
          skipped++;
          continue;
        }

        await this.resourceModel.create({
          ...data,
          postedBy: superAdminDoc._id,
          source,
          externalId,
        });
        created++;
      } catch (error: any) {
        this.logger.warn(`Failed to process resource ${raw?.title} from ${raw?.source}: ${error.message}`);
        syncErrors.push({
          source: raw?.source || 'unknown',
          message: error.message,
          externalId: raw?.externalId || null,
        });
      }
    }

      const finalStats = {
        created,
        skipped,
        devtoFetched: results.devto.length,
        mediumFetched: results.medium.length,
      };

      if (syncLogId) {
        await this.syncLogsService.updateLogSuccess(syncLogId, finalStats, syncErrors);
      }

      return {
        ...finalStats,
        errors: syncErrors,
      };
    } catch (error: any) {
      this.logger.error(`Error in runExternalResourceFetch: ${error.message}`, error.stack);
      if (syncLogId) {
        await this.syncLogsService.updateLogFailure(syncLogId, error);
      }
      throw error;
    }
  }
}
