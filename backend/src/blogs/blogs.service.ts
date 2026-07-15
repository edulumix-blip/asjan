import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { UsersService } from '../users/users.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    private readonly usersService: UsersService,
  ) {}

  // Helper: fetch full HTML from Medium author's personal feed
  private async fetchMediumBlogHtmlLive(
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

  async getAllBlogs(queryParams: any) {
    const {
      author,
      category,
      isPublished,
      source,
      search,
      page = 1,
      limit = 50,
    } = queryParams;

    const query: any = {};
    if (author) query.author = author;
    if (category) query.category = category;
    if (source) query.source = source;
    if (isPublished !== undefined && isPublished !== '') {
      query.isPublished = isPublished === 'true' || isPublished === true;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const lim = Number.parseInt(limit, 10) || 50;
    const pg = Number.parseInt(page, 10) || 1;

    const total = await this.blogModel.countDocuments(query).exec();
    const blogs = await this.blogModel
      .find(query)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    return {
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      data: blogs,
    };
  }

  async getBlogs(userPayload: any, queryParams: any) {
    const {
      category,
      tag,
      search,
      source,
      page = 1,
      limit = 10,
      sort,
    } = queryParams;

    const query: any = { isPublished: true };

    // Public/contributors should not see soft-deleted blogs
    if (!userPayload || userPayload.role !== 'super_admin') {
      query.isDeleted = { $ne: true };
    }

    if (category) query.category = category;
    if (source) query.source = source;
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      query.$text = { $search: search };
    }

    let sortSpec: any = { isSponsored: -1, createdAt: -1 };
    if (sort === 'trending') {
      sortSpec = { isSponsored: -1, views: -1, likes: -1, createdAt: -1 };
    }

    const lim = Number.parseInt(limit, 10) || 10;
    const pg = Number.parseInt(page, 10) || 1;

    const blogs = await this.blogModel
      .find(query)
      .populate('author', 'name email avatar role')
      .sort(sortSpec)
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.blogModel.countDocuments(query).exec();

    return {
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      data: blogs,
    };
  }

  async getFeaturedBlogs(userPayload: any) {
    const query: any = { isPublished: true, isFeatured: true };
    if (!userPayload || userPayload.role !== 'super_admin') {
      query.isDeleted = { $ne: true };
    }

    const blogs = await this.blogModel
      .find(query)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return {
      success: true,
      count: blogs.length,
      data: blogs,
    };
  }

  async getBlogBySlug(slug: string, userPayload: any) {
    const query: any = { slug, isPublished: true };
    if (!userPayload || userPayload.role !== 'super_admin') {
      query.isDeleted = { $ne: true };
    }

    const blog = await this.blogModel
      .findOne(query)
      .populate('author', 'name email avatar bio role')
      .exec();

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return {
      success: true,
      data: blog,
    };
  }

  async createBlog(
    createBlogDto: CreateBlogDto,
    userId: string,
    userRole: string,
  ) {
    const content = createBlogDto.content || '';
    const excerpt =
      createBlogDto.excerpt ||
      (content ? content.substring(0, 200) + '...' : '');

    const blog = await this.blogModel.create({
      ...createBlogDto,
      author: new Types.ObjectId(userId),
      excerpt,
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
      message: 'Blog created successfully. You earned 1 point!',
      data: blog,
    };
  }

  async updateBlog(
    id: string,
    updateBlogDto: UpdateBlogDto,
    userId: string,
    userRole: string,
  ) {
    let blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Check ownership
    if (blog.author.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to update this blog');
    }

    blog = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    return {
      success: true,
      message: 'Blog updated successfully',
      data: blog,
    };
  }

  async deleteBlog(id: string, userId: string, userRole: string) {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    // Check ownership
    if (blog.author.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to delete this blog');
    }

    // Super admin: Permanently delete
    if (userRole === 'super_admin') {
      await this.blogModel.findByIdAndDelete(id).exec();
      return {
        success: true,
        message: 'Blog permanently deleted',
      };
    }

    // Contributor: Soft delete
    blog.isDeleted = true;
    blog.deletedAt = new Date();
    await blog.save();

    // Deduct 1 point from user (except super_admin)
    if (userRole !== 'super_admin') {
      try {
        await this.usersService.incrementPoints(blog.author.toString(), -1);
      } catch (pointsError) {
        console.error('Error updating points:', pointsError);
      }
    }

    return {
      success: true,
      message: 'Blog deleted successfully. 1 point deducted.',
    };
  }

  async likeBlog(id: string) {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    blog.likes += 1;
    await blog.save();

    return {
      success: true,
      likes: blog.likes,
    };
  }

  async getBlogFullContent(id: string) {
    const blog = await this.blogModel.findById(id).lean().exec();
    if (!blog || blog.isDeleted) {
      throw new NotFoundException('Blog not found');
    }

    // Dev.to — fetch fresh body_html via externalId
    if (blog.source === 'devto' && blog.externalId) {
      const apiKey = process.env.DEVTO_API_KEY;
      const headers: Record<string, string> = {
        Accept: 'application/vnd.forem.api-v1+json',
      };
      if (apiKey) headers['api-key'] = apiKey;
      const r = await fetch(`https://dev.to/api/articles/${blog.externalId}`, {
        headers,
      });
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
    if (blog.source === 'medium' && blog.externalLink) {
      const liveHtml = await this.fetchMediumBlogHtmlLive(blog.externalLink);
      if (liveHtml) {
        return {
          success: true,
          data: {
            bodyHtml: liveHtml,
            readingTimeMinutes: null,
            tags: blog.tags || [],
            reactions: 0,
            commentsCount: 0,
            publishedAt: (blog as any).createdAt || null,
            author: null,
          },
        };
      }
    }

    return { success: true, data: null };
  }

  async getMyBlogs(userId: string) {
    const blogs = await this.blogModel
      .find({ author: new Types.ObjectId(userId), isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: blogs.length,
      data: blogs,
    };
  }
}
