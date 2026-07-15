import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Job, JobDocument } from './schemas/job.schema';
import { UsersService } from '../users/users.service';
import { delay } from '../utils/delay';
import { SyncLogsService } from '../sync-logs/sync-logs.service';

@Injectable()
export class JobFetchService implements OnModuleInit {
  private readonly logger = new Logger(JobFetchService.name);
  private readonly JOB_SEARCH_QUERY =
    process.env.JOB_FETCH_QUERY || 'jobs in India';
  private readonly STALE_CLOSE_DAYS = Number.parseInt(
    process.env.JOB_STALE_CLOSE_DAYS || '7',
    10,
  );

  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  onModuleInit() {
    const enabled =
      process.env.JOB_FETCH_CRON_ENABLED !== 'false' &&
      process.env.ENABLE_CRON_JOBS !== 'false';
    if (!enabled) {
      console.log(
        '⏸️  Daily job fetch cron is disabled (JOB_FETCH_CRON_ENABLED=false or ENABLE_CRON_JOBS=false)',
      );
      return;
    }

    const schedule = process.env.JOB_FETCH_CRON_SCHEDULE || '50 3 * * *';
    const timezone = process.env.JOB_FETCH_CRON_TIMEZONE || 'Asia/Kolkata';

    try {
      const job = new CronJob(
        schedule,
        async () => {
          console.log('📥 [Cron] Daily job fetch started...');
          const startTime = Date.now();
          try {
            const result = await this.runExternalJobFetch();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(
              `📥 [Cron] Job fetch completed in ${elapsed}s: created=${result.created}, skipped=${result.skipped}`,
            );
          } catch (err: any) {
            console.error('❌ [Cron] Job fetch failed:', err.message);
          }
        },
        null,
        false,
        timezone,
      );

      this.schedulerRegistry.addCronJob('daily-job-fetch', job);
      job.start();
      console.log(`⏰ Job fetch cron: daily at (${schedule}) - ${timezone}`);
    } catch (e: any) {
      console.warn(
        '⚠️  Invalid JOB_FETCH_CRON_SCHEDULE:',
        schedule,
        '- cron not started',
        e.message,
      );
    }
  }

  private mapCategory(label: string): string {
    if (!label) return 'Non IT Job';
    const l = String(label).toLowerCase();
    if (
      l.includes('it') ||
      l.includes('tech') ||
      l.includes('software') ||
      l.includes('developer')
    )
      return 'IT Job';
    if (l.includes('government') || l.includes('govt') || l.includes('gov'))
      return 'Govt Job';
    if (l.includes('remote') || l.includes('work from home'))
      return 'Remote Job';
    if (l.includes('intern') || l.includes('trainee')) return 'Internship';
    if (l.includes('part') || l.includes('contract') || l.includes('temporary'))
      return 'Part Time Job';
    if (l.includes('walk') || l.includes('walk-in') || l.includes('drive'))
      return 'Walk In Drive';
    return 'Non IT Job';
  }

  private bucketFromYears(years: number): string {
    if (!Number.isFinite(years) || years <= 0) return 'Fresher';
    if (years <= 1) return '1 Year';
    if (years <= 2) return '2 Years';
    if (years <= 3) return '3 Years';
    if (years <= 4) return '4 Years';
    return '5+ Years';
  }

  private inferExperienceFromText(...parts: (string | undefined)[]): string {
    const text = parts
      .filter(Boolean)
      .map((p) => String(p).toLowerCase())
      .join(' ')
      .replace(/\s+/g, ' ');

    if (!text) return 'Fresher';

    if (
      /(freshers?|entry[ -]?level|no experience|0\s*(?:-|to)\s*1\s*(years?|yrs?))/i.test(
        text,
      )
    ) {
      return 'Fresher';
    }

    const yearCandidates: number[] = [];

    for (const m of text.matchAll(
      /(\d{1,2})\s*[-to]{1,3}\s*(\d{1,2})\s*\+?\s*(years?|yrs?|y)\b/g,
    )) {
      yearCandidates.push(Number.parseInt(m[2], 10));
    }
    for (const m of text.matchAll(/(\d{1,2})\s*\+\s*(years?|yrs?|y)\b/g)) {
      yearCandidates.push(Number.parseInt(m[1], 10));
    }
    for (const m of text.matchAll(
      /(?:minimum|min)\s*(\d{1,2})\s*(years?|yrs?|y)\b/g,
    )) {
      yearCandidates.push(Number.parseInt(m[1], 10));
    }
    for (const m of text.matchAll(
      /(?:experience|exp)\s*(?:of|:)?\s*(\d{1,2})\s*(years?|yrs?|y)?\b/g,
    )) {
      yearCandidates.push(Number.parseInt(m[1], 10));
    }

    const maxYears = yearCandidates
      .filter((n) => Number.isFinite(n) && n >= 0)
      .reduce((max, n) => Math.max(max, n), -1);

    return this.bucketFromYears(maxYears);
  }

  private inferJSearchExperience(record: any): string {
    const months = Number.parseFloat(
      record?.job_required_experience?.required_experience_in_months,
    );
    if (Number.isFinite(months) && months >= 0) {
      return this.bucketFromYears(Math.ceil(months / 12));
    }
    return this.inferExperienceFromText(
      record?.job_title,
      record?.job_description,
      record?.job_highlights?.Qualifications,
      record?.job_employment_type,
    );
  }

  async fetchFromAdzuna(resultsPerPage = 20): Promise<any[]> {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error('ADZUNA_APP_ID and ADZUNA_APP_KEY must be set in .env');
    }

    const jobs: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      if (page > 1) {
        await delay(200);
      }
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=${resultsPerPage}&content-type=application/json`;
      const res = await fetch(url);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Adzuna API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      const results = data.results || [];

      for (const r of results) {
        jobs.push({
          externalId: String(r.id),
          source: 'adzuna',
          title: r.title?.trim() || 'Untitled',
          company:
            r.company?.display_name?.trim() ||
            r.company?.trim() ||
            'Unknown Company',
          location:
            r.location?.display_name?.trim() ||
            r.location?.area?.join(', ') ||
            'India',
          category: this.mapCategory(r.category?.label || r.category?.tag),
          experience: this.inferExperienceFromText(
            r.title,
            r.description,
            r.category?.label,
          ),
          salary:
            r.salary_min || r.salary_max
              ? `${r.salary_min || '?'} - ${r.salary_max || '?'}`
              : 'Not Disclosed',
          status: 'Open',
          companyLogo: r.company?.logo || '',
          applyLink: r.redirect_url || r.link || '',
          description: r.description?.trim() || r.title || 'Apply via link',
        });
      }

      const count = data.count ?? 0;
      const returned = results.length;
      hasMore = returned > 0 && jobs.length < count && page < 5;
      page++;
    }

    return jobs;
  }

  async fetchFromJSearch(numPages = 2): Promise<any[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    const host = process.env.RAPIDAPI_JSEARCH_HOST || 'jsearch.p.rapidapi.com';

    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY must be set in .env');
    }

    const jobs: any[] = [];
    const query = this.JOB_SEARCH_QUERY;

    for (let page = 1; page <= numPages; page++) {
      if (page > 1) {
        await delay(200);
      }
      const url =
        `https://` +
        host +
        `/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`JSearch API error: ${res.status} - ${errText}`);
      }

      const data = await res.json();
      const results = data.data || [];

      for (const r of results) {
        const employer = r.employer_name || 'Unknown Company';
        const jobId =
          r.job_id || r.job_publisher + (r.job_id || '') + r.job_title;

        jobs.push({
          externalId: String(jobId),
          source: 'jsearch',
          title: r.job_title?.trim() || 'Untitled',
          company: employer,
          location:
            r.job_city && r.job_country
              ? `${r.job_city}, ${r.job_country}`
              : r.job_country || 'India',
          category: this.mapCategory(r.job_title || r.job_employment_type),
          experience: this.inferJSearchExperience(r),
          salary:
            r.job_min_salary || r.job_max_salary
              ? `${r.job_min_salary || '?'} - ${r.job_max_salary || '?'} ${r.job_salary_currency || 'INR'}`
              : 'Not Disclosed',
          status: 'Open',
          companyLogo: r.employer_logo || '',
          applyLink: r.job_apply_link || r.job_google_link || '',
          description:
            r.job_description?.trim() || r.job_title || 'Apply via link',
        });
      }
    }

    return jobs;
  }

  async runExternalJobFetch(adzunaLimit = 20, jsearchPages = 2, syncLogId?: string) {
    try {
      const superAdminDoc = await this.usersService.findSuperAdmin();

      if (!superAdminDoc) {
        const errorMsg = 'Super Admin user not found. Please register super admin first.';
        if (syncLogId) {
          await this.syncLogsService.updateLogFailure(syncLogId, errorMsg);
        }
        throw new Error(errorMsg);
      }

    const results = {
      adzuna: [] as any[],
      jsearch: [] as any[],
      errors: [] as any[],
    };

    try {
      results.adzuna = await this.fetchFromAdzuna(adzunaLimit);
    } catch (e: any) {
      this.logger.error(`Error fetching from Adzuna: ${e.message}`, e.stack);
      results.errors.push({ source: 'adzuna', message: e.message });
    }

    try {
      results.jsearch = await this.fetchFromJSearch(jsearchPages);
    } catch (e: any) {
      this.logger.error(`Error fetching from JSearch: ${e.message}`, e.stack);
      results.errors.push({ source: 'jsearch', message: e.message });
    }

    const syncErrors = [...results.errors];
    let created = 0;
    let skipped = 0;
    let reopened = 0;
    let autoClosed = 0;
    const now = new Date();
    const staleBefore = new Date(
      now.getTime() - this.STALE_CLOSE_DAYS * 24 * 60 * 60 * 1000,
    );

    const allJobs = [...results.adzuna, ...results.jsearch];
    const errorSources = new Set(results.errors.map((err) => err.source));
    const successfulSources = ['adzuna', 'jsearch'].filter(
      (source) => !errorSources.has(source),
    );

    for (const raw of allJobs) {
      try {
        const { externalId, source, ...jobData } = raw;
        if (!jobData.applyLink || !jobData.title || !jobData.company) continue;

        const exists = await this.jobModel
          .findOne({ source, externalId })
          .exec();

        if (exists) {
          const wasClosed = exists.status === 'Closed';
          Object.assign(exists, {
            ...jobData,
            status: 'Open',
            closedSyncedAt: null,
            lastSeenAt: now,
          });
          await exists.save();
          if (wasClosed) reopened++;
          skipped++;
          continue;
        }

        await this.jobModel.create({
          ...jobData,
          status: 'Open',
          postedBy: superAdminDoc._id,
          source,
          externalId,
          lastSeenAt: now,
        });
        created++;
      } catch (error: any) {
        this.logger.warn(`Failed to process job ${raw?.title} from ${raw?.source}: ${error.message}`);
        syncErrors.push({
          source: raw?.source || 'unknown',
          message: error.message,
          externalId: raw?.externalId || null,
        });
      }
    }

      if (successfulSources.length > 0) {
        const closeResult = await this.jobModel
          .updateMany(
            {
              source: { $in: successfulSources },
              externalId: { $exists: true, $ne: null },
              isDeleted: { $ne: true },
              status: 'Open',
              lastSeenAt: { $ne: null, $lt: staleBefore },
            },
            {
              $set: {
                status: 'Closed',
                closedSyncedAt: now,
              },
            },
          )
          .exec();
        autoClosed = closeResult.modifiedCount || 0;
      }

      const finalStats = {
        created,
        skipped,
        reopened,
        autoClosed,
        staleCloseDays: this.STALE_CLOSE_DAYS,
        adzunaFetched: results.adzuna.length,
        jsearchFetched: results.jsearch.length,
      };

      if (syncLogId) {
        await this.syncLogsService.updateLogSuccess(syncLogId, finalStats, syncErrors);
      }

      return {
        ...finalStats,
        errors: syncErrors,
      };
    } catch (error: any) {
      this.logger.error(`Error in runExternalJobFetch: ${error.message}`, error.stack);
      if (syncLogId) {
        await this.syncLogsService.updateLogFailure(syncLogId, error);
      }
      throw error;
    }
  }
}
