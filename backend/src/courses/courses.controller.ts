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
import { CoursesService } from './courses.service';
import { CourseFetchService } from './course-fetch.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { FetchExternalCoursesDto } from './dto/fetch-external-courses.dto';
import { SyncLogsService } from '../sync-logs/sync-logs.service';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly courseFetchService: CourseFetchService,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('fetch-external')
  async fetchExternalCourses(
    @GetUser('id') userId: string,
    @Body() dto: FetchExternalCoursesDto,
  ) {
    const taskName = 'fetch-external-courses';
    
    // Create running log in DB
    const log = await this.syncLogsService.createLog(taskName, userId);
    
    this.courseFetchService.runExternalCourseFetch(dto.limit, log._id.toString())
      .catch((error) => {
        this.syncLogsService.updateLogFailure(log._id.toString(), error);
      });

    return {
      success: true,
      message: 'Course synchronization started in the background.',
      logId: log._id.toString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('all')
  async getAllCourses(@Query() query: any) {
    return this.coursesService.getAllCourses(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('id/:id')
  async getCourseById(@Param('id') id: string) {
    return this.coursesService.getCourseById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-publish')
  async togglePublish(@Param('id') id: string) {
    return this.coursesService.togglePublish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.coursesService.toggleFeatured(id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async getCourses(@Query() query: any) {
    return this.coursesService.getCourses(query);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('filter-options')
  async getCourseFilterOptions() {
    return this.coursesService.getCourseFilterOptions();
  }

  @UseInterceptors(CacheInterceptor)
  @Get('featured')
  async getFeaturedCourses() {
    return this.coursesService.getFeaturedCourses();
  }

  @Get('count')
  async getCoursesCount() {
    return this.coursesService.getCoursesCount();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post()
  async createCourse(
    @GetUser('id') userId: string,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.coursesService.createCourse(createCourseDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id')
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.updateCourse(id, updateCourseDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Delete(':id')
  async deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':slug')
  async getCourseBySlug(@Param('slug') slug: string) {
    return this.coursesService.getCourseBySlug(slug);
  }
}
