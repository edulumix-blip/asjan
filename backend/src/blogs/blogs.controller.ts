import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BlogsService } from './blogs.service';
import { BlogFetchService } from './blog-fetch.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { FetchExternalBlogsDto } from './dto/fetch-external-blogs.dto';
import { SyncLogsService } from '../sync-logs/sync-logs.service';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogFetchService: BlogFetchService,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('fetch-external')
  async fetchExternalBlogs(
    @GetUser('id') userId: string,
    @Body() dto: FetchExternalBlogsDto,
  ) {
    const taskName = 'fetch-external-blogs';
    
    // Create running log in DB
    const log = await this.syncLogsService.createLog(taskName, userId);
    
    this.blogFetchService.runExternalBlogFetch(dto, log._id.toString())
      .catch((error) => {
        this.syncLogsService.updateLogFailure(log._id.toString(), error);
      });

    return {
      success: true,
      message: 'Blog synchronization started in the background.',
      logId: log._id.toString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/blogs')
  async getMyBlogs(@GetUser('id') userId: string) {
    return this.blogsService.getMyBlogs(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('all')
  async getAllBlogs(@Query() query: any) {
    return this.blogsService.getAllBlogs(query);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getBlogs(@GetUser() user: any, @Query() query: any) {
    return this.blogsService.getBlogs(user, query);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('featured')
  async getFeaturedBlogs(@GetUser() user: any) {
    return this.blogsService.getFeaturedBlogs(user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/full-content')
  async getBlogFullContent(@Param('id') id: string) {
    return this.blogsService.getBlogFullContent(id);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  async getBlogBySlug(@GetUser() user: any, @Param('slug') slug: string) {
    return this.blogsService.getBlogBySlug(slug, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put(':id/like')
  async likeBlog(@Param('id') id: string) {
    return this.blogsService.likeBlog(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'blog_poster', 'tech_blog_poster')
  @Post()
  async createBlog(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    return this.blogsService.createBlog(createBlogDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'blog_poster', 'tech_blog_poster')
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogsService.updateBlog(id, updateBlogDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'blog_poster', 'tech_blog_poster')
  @Delete(':id')
  async deleteBlog(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
  ) {
    return this.blogsService.deleteBlog(id, userId, userRole);
  }
}
