import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Course, CourseDocument } from './schemas/course.schema';
import { UsersService } from '../users/users.service';
import { delay } from '../utils/delay';
import { SyncLogsService } from '../sync-logs/sync-logs.service';

@Injectable()
export class CourseFetchService implements OnModuleInit {
  private readonly logger = new Logger(CourseFetchService.name);
  private readonly VINTAROK_HOST =
    'udemy-coupons-courses-instructors-data-api.p.rapidapi.com';
  private readonly UDEMY_FREE_HOST =
    process.env.RAPIDAPI_UDEMY_FREE_HOST || 'udemy-free-courses.p.rapidapi.com';
  private readonly UDEMY_HOST =
    process.env.RAPIDAPI_UDEMY_HOST ||
    'paid-udemy-course-for-free.p.rapidapi.com';

  private readonly FALLBACK_COURSES = [
    {
      title: 'Python for Beginners',
      url: 'https://www.udemy.com/course/pythonforbeginners/',
      category: 'Programming Languages',
    },
    {
      title: 'JavaScript Fundamentals',
      url: 'https://www.udemy.com/course/javascript-for-beginners/',
      category: 'Web Development',
    },
    {
      title: 'Web Development Bootcamp',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      category: 'Web Development',
    },
    {
      title: 'Data Structures & Algorithms',
      url: 'https://www.udemy.com/course/datastructurescncpp/',
      category: 'DSA',
    },
    {
      title: 'React - The Complete Guide',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      category: 'Web Development',
    },
  ];

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    private readonly usersService: UsersService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  onModuleInit() {
    const enabled =
      process.env.COURSE_FETCH_CRON_ENABLED !== 'false' &&
      process.env.ENABLE_CRON_JOBS !== 'false';
    if (!enabled) {
      console.log(
        '⏸️  Daily course fetch cron is disabled (COURSE_FETCH_CRON_ENABLED=false or ENABLE_CRON_JOBS=false)',
      );
      return;
    }

    const schedule = process.env.COURSE_FETCH_CRON_SCHEDULE || '0 12 * * *';
    const timezone = process.env.COURSE_FETCH_CRON_TIMEZONE || 'Asia/Kolkata';

    try {
      const job = new CronJob(
        schedule,
        async () => {
          console.log('📥 [Cron] Daily course fetch started...');
          const startTime = Date.now();
          try {
            const result = await this.runExternalCourseFetch();
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(
              `📥 [Cron] Course fetch completed in ${elapsed}s: created=${result.created}, skipped=${result.skipped}`,
            );
          } catch (err: any) {
            console.error('❌ [Cron] Course fetch failed:', err.message);
          }
        },
        null,
        false,
        timezone,
      );

      this.schedulerRegistry.addCronJob('daily-course-fetch', job);
      job.start();
      console.log(`⏰ Course fetch cron: daily at (${schedule}) - ${timezone}`);
    } catch (e: any) {
      console.warn(
        '⚠️  Invalid COURSE_FETCH_CRON_SCHEDULE:',
        schedule,
        '- cron not started',
        e.message,
      );
    }
  }

  private mapCategory(label: string): string {
    if (!label) return 'Others';
    const l = String(label).toLowerCase();
    if (l.includes('web') || l.includes('frontend') || l.includes('full stack'))
      return 'Web Development';
    if (l.includes('mobile') || l.includes('android') || l.includes('ios'))
      return 'Mobile Development';
    if (l.includes('data') || l.includes('analytics')) return 'Data Science';
    if (l.includes('machine learning') || l.includes('ml') || l.includes('ai'))
      return 'Machine Learning';
    if (
      l.includes('devops') ||
      l.includes('docker') ||
      l.includes('kubernetes')
    )
      return 'DevOps';
    if (l.includes('cyber') || l.includes('security')) return 'Cybersecurity';
    if (l.includes('cloud') || l.includes('aws') || l.includes('azure'))
      return 'Cloud Computing';
    if (l.includes('ui') || l.includes('ux') || l.includes('design'))
      return 'UI/UX Design';
    if (l.includes('marketing') || l.includes('digital'))
      return 'Digital Marketing';
    if (l.includes('interview') || l.includes('dsa') || l.includes('algorithm'))
      return 'Interview Prep';
    if (l.includes('dsa') || l.includes('data structure')) return 'DSA';
    if (l.includes('python') || l.includes('javascript') || l.includes('java'))
      return 'Programming Languages';
    return 'Others';
  }

  private truncate(s: string, max = 5000): string {
    if (!s || typeof s !== 'string') return '';
    const clean = String(s)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return clean.length <= max ? clean : clean.slice(0, max - 3) + '...';
  }

  private parsePrice(val: any): number {
    if (val == null) return 0;
    const str = String(val).replace(/[^0-9.]/g, '');
    const n = Number.parseFloat(str);
    return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100;
  }

  private toINR(usd: number): number {
    const rate = Number(process.env.USD_TO_INR_RATE) || 84;
    return Math.round(usd * rate);
  }

  private fetchUdemyApi(apiKey: string, host: string, path: string) {
    const url = `https://${host}${path}`;
    return fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'x-rapidapi-key': apiKey,
        'X-RapidAPI-Host': host,
        'x-rapidapi-host': host,
      },
    });
  }

  private normalizeWithRaw(c: any, rawObj: any) {
    const raw = rawObj || c;
    const getStr = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v != null && typeof v === 'string') return v.trim();
      }
      return '';
    };
    const getNum = (obj: any, ...keys: string[]) => {
      for (const k of keys) {
        const v = obj?.[k];
        if (v != null) {
          const n = Number.parseFloat(String(v).replace(/[^0-9.]/g, ''));
          if (!Number.isNaN(n)) return n;
        }
      }
      return 0;
    };
    const getUrl = (obj: any) => {
      const u =
        obj?.url ||
        obj?.link ||
        obj?.course_url ||
        obj?.enrollment_url ||
        obj?.coupon;
      if (typeof u === 'string' && (u.startsWith('http') || u.startsWith('//')))
        return u;
      if (obj?.id && obj?.slug)
        return `https://www.udemy.com/course/${obj.slug || obj.id}/`;
      return '';
    };

    const title =
      getStr(c, 'title', 'name', 'headline') ||
      getStr(raw, 'title', 'name', 'headline') ||
      'Untitled';
    const desc =
      getStr(c, 'desc_text', 'description', 'headline') ||
      getStr(raw, 'desc_text', 'description', 'headline') ||
      title;
    const image =
      getStr(c, 'pic', 'image_url', 'image', 'thumbnail') ||
      getStr(raw, 'pic', 'image_url', 'image', 'thumbnail');
    const url = getUrl(c) || getUrl(raw);
    const extId = String(c?.id ?? c?.sku ?? raw?.id ?? raw?.sku ?? title + url);

    if (!url && !extId) return null;

    return {
      externalId: extId,
      source: 'udemy',
      rawApiData: raw,
      title: title.slice(0, 150),
      description: this.truncate(desc, 5000),
      shortDescription: this.truncate(desc, 300),
      thumbnail: image,
      category: this.mapCategory(
        c?.category ??
          c?.primary_category ??
          raw?.category ??
          raw?.primary_category,
      ),
      level: 'All Levels',
      actualPrice: this.toINR(
        this.parsePrice(
          c?.org_price ?? raw?.org_price ?? c?.price ?? raw?.price,
        ),
      ),
      offerPrice: 0,
      isFree: true,
      lessons: [],
      totalDuration:
        getNum(c, 'duration_minutes') ||
        getNum(c, 'duration') * 60 ||
        getNum(raw, 'duration_minutes') ||
        getNum(raw, 'duration') * 60 ||
        0,
      totalLessons: 0,
      instructor: {
        name:
          c?.instructor?.name ??
          raw?.instructor?.name ??
          c?.authors?.[0]?.display_name ??
          raw?.authors?.[0]?.display_name ??
          'Udemy Instructor',
        bio: c?.instructor?.bio ?? raw?.instructor?.job_title ?? '',
        avatar:
          c?.instructor?.avatar ??
          raw?.instructor?.image ??
          raw?.authors?.[0]?.image ??
          '',
      },
      enrollmentLink: url,
      isPublished: true,
      tags: []
        .concat(
          c?.category ?? raw?.category ?? [],
          c?.primary_subcategory ?? raw?.primary_subcategory ?? [],
        )
        .filter(Boolean),
    };
  }

  private normalizeCourse(c: any, author: any = {}) {
    if (
      c.coupon &&
      typeof c.coupon === 'string' &&
      c.coupon.startsWith('http')
    ) {
      const enrollmentLink = c.coupon;
      if (!enrollmentLink || !c.title) return null;
      const usdPrice = this.parsePrice(c.org_price) || 0;
      const actualPrice = this.toINR(usdPrice);
      return {
        externalId: String(c.id || c.sku || c.title + enrollmentLink),
        source: 'udemy',
        rawApiData: c,
        title: (c.title || '').trim().slice(0, 150) || 'Untitled',
        description: this.truncate(
          c.desc_text || c.description || c.title,
          5000,
        ),
        shortDescription: this.truncate(
          c.desc_text || c.description || c.title,
          300,
        ),
        thumbnail: c.pic || c.image_url || c.image || '',
        category: this.mapCategory(c.category || c.primary_category),
        level: 'All Levels',
        actualPrice: actualPrice || 0,
        offerPrice: 0,
        isFree: true,
        lessons: [],
        totalDuration: (c.duration || 0) * 60 || 0,
        totalLessons: 0,
        instructor: { name: 'Udemy Instructor', bio: '', avatar: '' },
        enrollmentLink,
        isPublished: true,
        tags: [].concat(c.category || []).filter(Boolean),
      };
    }

    const course = c.course || c;
    const coupon = c.coupon || course.coupon || {};
    const courseAuthors = course.authors || c.authors || [];
    const courseAuthor = courseAuthors[0] || author;
    const courseUrl = course.url || course.link || course.course_url || '';
    const couponCode = coupon.code || course.coupon_code || '';
    const usdPrice = coupon.regular_price ?? course.price ?? 0;
    const actualPriceINR = this.toINR(this.parsePrice(usdPrice));

    let enrollmentLink = courseUrl;
    if (couponCode && courseUrl) {
      enrollmentLink = courseUrl.includes('?')
        ? `${courseUrl}&couponCode=${couponCode}`
        : `${courseUrl}?couponCode=${couponCode}`;
    } else if (course.id && couponCode) {
      enrollmentLink = `https://www.udemy.com/course/${course.slug || course.id}/?couponCode=${couponCode}`;
    } else if (courseUrl) {
      enrollmentLink = courseUrl;
    } else if (course.id) {
      enrollmentLink = `https://www.udemy.com/course/${course.slug || course.id}/`;
    }
    if (!enrollmentLink || !course.title) return null;

    return {
      externalId: String(
        course.id || course.course_id || course.title + courseUrl,
      ),
      source: 'udemy',
      rawApiData: c,
      title: (course.title || '').trim().slice(0, 150) || 'Untitled',
      description: this.truncate(
        course.description || course.headline || course.title,
        5000,
      ),
      shortDescription: this.truncate(
        course.description || course.headline || course.title,
        300,
      ),
      thumbnail:
        course.image_url ||
        course.image ||
        course.thumbnail ||
        course.image_240x135 ||
        '',
      category: this.mapCategory(course.primary_category || course.category),
      level: 'All Levels',
      actualPrice: actualPriceINR || 0,
      offerPrice: 0,
      isFree: true,
      lessons: [],
      totalDuration:
        course.duration_minutes || (course.duration_hours || 0) * 60 || 0,
      totalLessons: 0,
      instructor: {
        name:
          courseAuthor?.display_name ||
          courseAuthor?.name ||
          'Udemy Instructor',
        bio: courseAuthor?.job_title || '',
        avatar: courseAuthor?.image || courseAuthor?.avatar || '',
      },
      enrollmentLink,
      isPublished: true,
      tags: []
        .concat(course.primary_category || [], course.primary_subcategory || [])
        .filter(Boolean),
    };
  }

  private extractCourseItems(data: any) {
    if (Array.isArray(data)) return data;
    const list =
      data?.courses || data?.data || data?.results || data?.items || [];
    return Array.isArray(list) ? list : [];
  }

  async fetchFromVintarokApi(
    apiKey: string,
    limit: number,
  ): Promise<any[] | null> {
    const courses: any[] = [];
    const seenIds = new Set<string>();
    const queries = [
      'web',
      'python',
      'javascript',
      'react',
      'programming',
      'data',
    ];

    for (const q of queries) {
      if (courses.length >= limit) break;
      await delay(200);
      try {
        const res = await this.fetchUdemyApi(
          apiKey,
          this.VINTAROK_HOST,
          `/courses.php?q=${encodeURIComponent(q)}&limit=10`,
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.ok === false || data?.error) continue;

        const items = Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data?.data?.courses)
            ? data.data.courses
            : Array.isArray(data?.data)
              ? data.data
              : this.extractCourseItems(data);

        for (const item of items) {
          const norm = this.normalizeCourse(item);
          if (norm && !seenIds.has(norm.externalId)) {
            seenIds.add(norm.externalId);
            courses.push(norm);
            if (courses.length >= limit) return courses;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Error fetching Udemy courses for query ${q}: ${err.message}`);
      }
    }

    if (courses.length === 0) {
      for (const q of queries) {
        if (courses.length >= limit) break;
        await delay(200);
        try {
          const res = await this.fetchUdemyApi(
            apiKey,
            this.VINTAROK_HOST,
            `/api/v1/author?q=${encodeURIComponent(q)}&include=courses&limit=10`,
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (data?.ok === false || data?.error) continue;

          let items: any[] = [];
          if (Array.isArray(data?.courses)) items = data.courses;
          else if (Array.isArray(data?.data?.courses))
            items = data.data.courses;
          else if (data?.author?.courses) {
            items = Array.isArray(data.author.courses)
              ? data.author.courses
              : [data.author.courses];
          }

          for (const item of items) {
            const norm = this.normalizeCourse(item);
            if (norm && !seenIds.has(norm.externalId)) {
              seenIds.add(norm.externalId);
              courses.push(norm);
              if (courses.length >= limit) return courses;
            }
          }
        } catch (err: any) {
          this.logger.warn(`Error fetching Udemy courses by author for query ${q}: ${err.message}`);
        }
      }
    }

    return courses.length > 0 ? courses : null;
  }

  async fetchFromUdemyFreeApi(
    apiKey: string,
    limit: number,
  ): Promise<any[] | null> {
    const courses: any[] = [];
    const seenIds = new Set<string>();
    for (
      let pagination = 0;
      pagination <= 2 && courses.length < limit;
      pagination++
    ) {
      if (pagination > 0) {
        await delay(200);
      }
      const res = await this.fetchUdemyApi(
        apiKey,
        this.UDEMY_FREE_HOST,
        `/courses/?pagination=${pagination}`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.messages?.includes?.('unreachable') || data?.info) return null;
      const items = this.extractCourseItems(data);
      for (const c of items) {
        const norm = this.normalizeWithRaw(c, c);
        if (norm && !seenIds.has(norm.externalId)) {
          seenIds.add(norm.externalId);
          courses.push(norm);
          if (courses.length >= limit) return courses;
        }
      }
    }
    return courses;
  }

  async fetchFromUdemy(limit = 15): Promise<any[]> {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) throw new Error('RAPIDAPI_KEY must be set in .env');

    const courses: any[] = [];
    const seenIds = new Set<string>();
    let lastError: string | null = null;

    try {
      const vintarok = await this.fetchFromVintarokApi(apiKey, limit);
      if (vintarok && vintarok.length > 0) return vintarok;
    } catch (_) {}

    try {
      const free = await this.fetchFromUdemyFreeApi(apiKey, limit);
      if (free && free.length > 0) return free;
    } catch (_) {}

    const host = this.UDEMY_HOST;

    for (let page = 0; page <= 2 && courses.length < limit; page++) {
      const res = await this.fetchUdemyApi(apiKey, host, `/?page=${page}`);
      if (!res.ok) {
        lastError = `[${host}] ${res.status}`;
        break;
      }
      const data = await res.json();
      const items =
        data.value ||
        data.courses ||
        data.data ||
        (Array.isArray(data) ? data : []);
      for (const c of Array.isArray(items) ? items : []) {
        const normalized = this.normalizeCourse(c);
        if (normalized && !seenIds.has(normalized.externalId)) {
          seenIds.add(normalized.externalId);
          courses.push(normalized);
          if (courses.length >= limit) return courses.slice(0, limit);
        }
      }
    }

    if (courses.length === 0 && lastError) {
      throw new Error(`Udemy API error: ${lastError}`);
    }

    return courses.slice(0, limit);
  }

  async runExternalCourseFetch(limit = 15, syncLogId?: string) {
    try {
      const superAdminDoc = await this.usersService.findSuperAdmin();

      if (!superAdminDoc) {
        const errorMsg = 'Super Admin user not found. Please register super admin first.';
        if (syncLogId) {
          await this.syncLogsService.updateLogFailure(syncLogId, errorMsg);
        }
        throw new Error(errorMsg);
      }

    const results = { udemy: [] as any[], errors: [] as any[] };

    try {
      results.udemy = await this.fetchFromUdemy(limit);
    } catch (e: any) {
      results.udemy = this.FALLBACK_COURSES.slice(0, limit).map((c, i) => ({
        externalId: `fallback-${i}`,
        source: 'udemy',
        title: c.title,
        description: `Free Udemy course - ${c.title}. Enroll via the link.`,
        shortDescription: `Free course: ${c.title}`,
        thumbnail: '',
        category: c.category,
        level: 'All Levels',
        actualPrice: 0,
        offerPrice: 0,
        isFree: true,
        lessons: [],
        totalDuration: 0,
        totalLessons: 0,
        instructor: { name: 'Udemy Instructor', bio: '', avatar: '' },
        enrollmentLink: c.url,
        isPublished: true,
        tags: [c.category],
      }));
    }

    let created = 0;
    let skipped = 0;
    let updated = 0;

    for (const raw of results.udemy) {
      const exists = await this.courseModel
        .findOne({ source: raw.source, externalId: raw.externalId })
        .exec();
      if (exists) {
        if (raw.actualPrice > 0 || raw.offerPrice !== undefined) {
          await this.courseModel
            .findByIdAndUpdate(exists._id, {
              actualPrice: raw.actualPrice ?? exists.actualPrice,
              offerPrice: raw.offerPrice ?? exists.offerPrice,
            })
            .exec();
          updated++;
        }
        skipped++;
        continue;
      }

      const { externalId, source, rawApiData, ...data } = raw;
      if (!data.title || !data.enrollmentLink) continue;

      await this.courseModel.create({
        ...data,
        postedBy: superAdminDoc._id,
        source,
        externalId,
        rawApiData: rawApiData || null,
      });
      created++;
    }

      const finalStats = {
        created,
        skipped,
        updated,
        udemyFetched: results.udemy.length,
      };

      if (syncLogId) {
        await this.syncLogsService.updateLogSuccess(syncLogId, finalStats, results.errors);
      }

      return {
        ...finalStats,
        errors: results.errors,
      };
    } catch (error: any) {
      this.logger.error(`Error in runExternalCourseFetch: ${error.message}`, error.stack);
      if (syncLogId) {
        await this.syncLogsService.updateLogFailure(syncLogId, error);
      }
      throw error;
    }
  }
}
