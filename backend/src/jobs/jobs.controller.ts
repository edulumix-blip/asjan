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
import { JobsService } from './jobs.service';
import { JobFetchService } from './job-fetch.service';
import { CreateJobDto } from './dto/create-job.dto';
import { FetchExternalJobsDto } from './dto/fetch-external-jobs.dto';
import { SyncLogsService } from '../sync-logs/sync-logs.service';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobFetchService: JobFetchService,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('my/jobs')
  async getMyJobs(@GetUser('id') userId: string) {
    return this.jobsService.getMyJobs(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('fetch-external')
  async fetchExternalJobs(
    @GetUser('id') userId: string,
    @Body() dto: FetchExternalJobsDto,
  ) {
    const taskName = 'fetch-external-jobs';
    
    // Create running log in DB
    const log = await this.syncLogsService.createLog(taskName, userId);
    
    this.jobFetchService.runExternalJobFetch(dto.adzunaLimit, dto.jsearchPages, log._id.toString())
      .catch((error) => {
        this.syncLogsService.updateLogFailure(log._id.toString(), error);
      });

    return {
      success: true,
      message: 'Job synchronization started in the background.',
      logId: log._id.toString(),
    };
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getJobs(@GetUser() user: any, @Query() query: any) {
    return this.jobsService.getJobs(user, query);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('stats')
  async getJobStats(@GetUser() user: any) {
    return this.jobsService.getJobStats(user);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('filter-options')
  async getJobFilterOptions(@GetUser() user: any) {
    return this.jobsService.getJobFilterOptions(user);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('grouped')
  async getJobsGrouped(@GetUser() user: any) {
    return this.jobsService.getJobsGrouped(user);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('slug/:slug')
  async getJobBySlug(@GetUser() user: any, @Param('slug') slug: string) {
    return this.jobsService.getJobBySlug(slug, user);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getJob(@GetUser() user: any, @Param('id') id: string) {
    return this.jobsService.getJobById(id, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put(':id/like')
  async likeJob(
    @GetUser('id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.jobsService.likeJob(id, userId || null);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'job_poster')
  @Post()
  async createJob(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.createJob(createJobDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'job_poster')
  @Put(':id')
  async updateJob(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.updateJob(id, updateJobDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'job_poster')
  @Delete(':id')
  async deleteJob(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
  ) {
    return this.jobsService.deleteJob(id, userId, userRole);
  }
}
