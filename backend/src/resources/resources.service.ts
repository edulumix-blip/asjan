import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { UsersService } from '../users/users.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

const escapeRegex = (s: string) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ResourcesService {
  private readonly RESOURCE_CATEGORY_KEYS = [
    'Software Notes',
    'Interview Notes',
    'Tools & Technology',
    'Trending Technology',
    'Video Resources',
    'Software Project',
    'Hardware Project',
  ];

  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
    private readonly usersService: UsersService,
  ) {}

  // Helper: Extract Medium article full HTML via live RSS fetch
  private async fetchMediumBodyHtmlLive(
    articleLink: string,
  ): Promise<string | null> {
    try {
      const url = new URL(articleLink);
      let feedUrl: string;
      if (
        url.hostname !== 'medium.com' &&
        url.hostname.endsWith('.medium.com')
      ) {
        feedUrl = `https://${url.hostname}/feed`;
      } else {
        const parts = url.pathname.replace(/^\//, '').split('/');
        if (!parts[0]) return null;
        feedUrl = `https://medium.com/feed/${parts[0]}`;
      }

      const res = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EduLumix/1.0 RSS reader)',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      const xml = await res.text();
      const normalLink = articleLink.split('?')[0].replace(/\/$/, '');
      const slug = normalLink.split('/').pop();
      if (!slug) return null;

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const item = match[1];
        if (!item.includes(slug)) continue;
        const contentMatch = item.match(
          /<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/,
        );
        if (contentMatch) return contentMatch[1].trim();
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  async getFullContent(id: string) {
    const resource = await this.resourceModel.findById(id).lean().exec();
    if (!resource) throw new NotFoundException('Resource not found');
    if (resource.isDeleted) throw new NotFoundException('Resource not found');

    // Dev.to — fetch full article HTML live via externalId
    if (resource.source === 'devto' && resource.externalId) {
      const apiKey = process.env.DEVTO_API_KEY;
      const headers: Record<string, string> = {
        Accept: 'application/vnd.forem.api-v1+json',
      };
      if (apiKey) headers['api-key'] = apiKey;

      const r = await fetch(
        `https://dev.to/api/articles/${resource.externalId}`,
        { headers },
      );
      if (!r.ok) throw new Error(`Dev.to API error: ${r.status}`);
      const article = await r.json();

      return {
        success: true,
        data: {
          bodyHtml: article.body_html || '',
          readingTimeMinutes: article.reading_time_minutes || null,
          tags: article.tag_list || [],
          reactions: article.positive_reactions_count || 0,
          commentsCount: article.comments_count || 0,
          publishedAt: article.published_at || null,
          author: {
            name: article.user?.name || '',
            username: article.user?.username || '',
            avatar: article.user?.profile_image || '',
          },
        },
      };
    }

    // Medium — live RSS fetch
    if (resource.source === 'medium') {
      const liveHtml = await this.fetchMediumBodyHtmlLive(resource.link);

      if (liveHtml) {
        // If live content is longer, update DB in background
        if (!resource.bodyHtml || liveHtml.length > resource.bodyHtml.length) {
          this.resourceModel
            .updateOne({ _id: resource._id }, { $set: { bodyHtml: liveHtml } })
            .catch(() => {});
        }
        return {
          success: true,
          data: {
            bodyHtml: liveHtml,
            readingTimeMinutes: null,
            tags: (resource as any).tags || [],
            reactions: 0,
            commentsCount: 0,
            publishedAt: (resource as any).createdAt || null,
            author: null,
          },
        };
      }

      // Fallback
      if (resource.bodyHtml) {
        return {
          success: true,
          data: {
            bodyHtml: resource.bodyHtml,
            readingTimeMinutes: null,
            tags: (resource as any).tags || [],
            reactions: 0,
            commentsCount: 0,
            publishedAt: (resource as any).createdAt || null,
            author: null,
          },
        };
      }

      return { success: true, data: null };
    }

    return { success: true, data: null };
  }

  async getResources(userPayload: any, queryParams: any) {
    const {
      category,
      subcategory,
      search,
      page = 1,
      limit = 12,
      source,
      isVideo,
      postedBy,
    } = queryParams;

    const query: any = {};

    // Public/contributors should not see soft-deleted resources
    if (!userPayload || userPayload.role !== 'super_admin') {
      query.isDeleted = { $ne: true };
    }

    if (category && category !== 'All') query.category = category;
    const subTrim = subcategory && String(subcategory).trim();
    if (subTrim && subTrim !== 'All') query.subcategory = subTrim;
    if (source && source !== 'All') query.source = source;
    if (postedBy && userPayload?.role === 'super_admin')
      query.postedBy = postedBy;
    if (isVideo === 'true') query.isVideo = true;
    if (isVideo === 'false') query.isVideo = false;

    const searchTrim = search && String(search).trim().slice(0, 120);
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), 'i');
      query.$or = [{ title: { $regex: rx } }, { description: { $regex: rx } }];
    }

    const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 100);
    const pg = Math.max(Number.parseInt(page, 10) || 1, 1);

    const resources = await this.resourceModel
      .find(query)
      .populate('postedBy', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.resourceModel.countDocuments(query).exec();

    return {
      success: true,
      count: resources.length,
      total,
      totalPages: Math.ceil(total / lim) || 1,
      currentPage: pg,
      data: resources,
    };
  }

  async getResourceFilterOptions(userPayload: any) {
    const base =
      !userPayload || userPayload.role !== 'super_admin'
        ? { isDeleted: { $ne: true } }
        : {};

    const [rawSubs, sourcesInDb] = await Promise.all([
      this.resourceModel.distinct('subcategory', base),
      this.resourceModel.distinct('source', base),
    ]);

    const subSet = new Set<string>();
    for (const s of rawSubs) {
      const t = String(s || '').trim();
      if (t) subSet.add(t);
    }
    const subcategories = [...subSet]
      .sort((a, b) => a.localeCompare(b, 'en'))
      .slice(0, 200);

    const sourceOrder = [
      'manual',
      'youtube',
      'devto',
      'freecodecamp',
      'hashnode',
      'medium',
      'hackernews',
    ];
    const sources = sourceOrder.filter((s) => sourcesInDb.includes(s));
    for (const s of sourcesInDb.sort()) {
      if (!sources.includes(s)) sources.push(s);
    }

    return {
      success: true,
      data: {
        categories: this.RESOURCE_CATEGORY_KEYS,
        subcategories,
        sources,
      },
    };
  }

  async getResourcesGrouped() {
    const categories = [
      'Software Notes',
      'Interview Notes',
      'Tools & Technology',
      'Trending Technology',
      'Video Resources',
      'Software Project',
      'Hardware Project',
    ];

    const groupedResources: any = {};
    const baseQuery = { isDeleted: { $ne: true } };

    for (const category of categories) {
      const resources = await this.resourceModel
        .find({ ...baseQuery, category })
        .populate('postedBy', 'name email avatar role')
        .sort({ createdAt: -1 })
        .limit(8)
        .exec();

      if (resources.length > 0) {
        groupedResources[category] = {
          resources,
          total: await this.resourceModel
            .countDocuments({ ...baseQuery, category })
            .exec(),
        };
      }
    }

    return {
      success: true,
      data: groupedResources,
    };
  }

  async getResourceById(id: string, userPayload: any) {
    let resource;
    try {
      resource = await this.resourceModel
        .findById(id)
        .populate('postedBy', 'name email avatar role')
        .exec();
    } catch (err: any) {
      if (err.name === 'CastError') {
        throw new NotFoundException('Resource not found');
      }
      throw err;
    }
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (
      resource.isDeleted &&
      (!userPayload || userPayload.role !== 'super_admin')
    ) {
      throw new NotFoundException('Resource not found');
    }

    return {
      success: true,
      data: resource,
    };
  }

  async createResource(
    createResourceDto: CreateResourceDto,
    userId: string,
    userRole: string,
  ) {
    const link = createResourceDto.link || '';
    const isVideo = link.includes('youtube.com') || link.includes('youtu.be');

    const resource = await this.resourceModel.create({
      ...createResourceDto,
      isVideo,
      postedBy: new Types.ObjectId(userId),
    });

    if (userRole !== 'super_admin') {
      try {
        await this.usersService.incrementPoints(userId, 1);
      } catch (pointsError) {
        console.error('Error updating points:', pointsError);
      }
    }

    return {
      success: true,
      message: 'Resource uploaded successfully. You earned 1 point!',
      data: resource,
    };
  }

  async updateResource(
    id: string,
    updateResourceDto: UpdateResourceDto,
    userId: string,
    userRole: string,
  ) {
    let resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Check ownership
    if (resource.postedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to update this resource');
    }

    const updateData: any = { ...updateResourceDto };
    if (updateData.link) {
      updateData.isVideo =
        updateData.link.includes('youtube.com') ||
        updateData.link.includes('youtu.be');
    }

    resource = await this.resourceModel
      .findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    return {
      success: true,
      message: 'Resource updated successfully',
      data: resource,
    };
  }

  async deleteResource(id: string, userId: string, userRole: string) {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Check ownership
    if (resource.postedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to delete this resource');
    }

    // Super admin: Permanently delete
    if (userRole === 'super_admin') {
      await this.resourceModel.findByIdAndDelete(id).exec();
      return {
        success: true,
        message: 'Resource permanently deleted',
      };
    }

    // Contributor: Soft delete
    resource.isDeleted = true;
    resource.deletedAt = new Date();
    await resource.save();

    // Deduct 1 point from user (except super_admin)
    if (userRole !== 'super_admin') {
      try {
        await this.usersService.incrementPoints(
          resource.postedBy.toString(),
          -1,
        );
      } catch (pointsError) {
        console.error('Error updating points:', pointsError);
      }
    }

    return {
      success: true,
      message: 'Resource deleted successfully. 1 point deducted.',
    };
  }

  async likeResource(id: string) {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    resource.likes += 1;
    await resource.save();

    return {
      success: true,
      likes: resource.likes,
    };
  }

  async incrementDownload(id: string) {
    const resource = await this.resourceModel.findById(id).exec();
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    resource.downloads += 1;
    await resource.save();

    return {
      success: true,
      downloads: resource.downloads,
    };
  }

  async getMyResources(userId: string) {
    const resources = await this.resourceModel
      .find({ postedBy: new Types.ObjectId(userId), isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: resources.length,
      data: resources,
    };
  }
}
