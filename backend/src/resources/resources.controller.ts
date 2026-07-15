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
import { ResourcesService } from './resources.service';
import { ResourceFetchService } from './resource-fetch.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { FetchExternalResourcesDto } from './dto/fetch-external-resources.dto';
import { SyncLogsService } from '../sync-logs/sync-logs.service';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('resources')
export class ResourcesController {
  constructor(
    private readonly resourcesService: ResourcesService,
    private readonly resourceFetchService: ResourceFetchService,
    private readonly syncLogsService: SyncLogsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post('fetch-external')
  async fetchExternalResources(
    @GetUser('id') userId: string,
    @Body() dto: FetchExternalResourcesDto,
  ) {
    const taskName = 'fetch-external-resources';
    
    // Create running log in DB
    const log = await this.syncLogsService.createLog(taskName, userId);
    
    this.resourceFetchService.runExternalResourceFetch(dto, log._id.toString())
      .catch((error) => {
        this.syncLogsService.updateLogFailure(log._id.toString(), error);
      });

    return {
      success: true,
      message: 'Resource synchronization started in the background.',
      logId: log._id.toString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/resources')
  async getMyResources(@GetUser('id') userId: string) {
    return this.resourcesService.getMyResources(userId);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async getResources(@GetUser() user: any, @Query() query: any) {
    return this.resourcesService.getResources(user, query);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('filter-options')
  async getResourceFilterOptions(@GetUser() user: any) {
    return this.resourcesService.getResourceFilterOptions(user);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('grouped')
  async getResourcesGrouped() {
    return this.resourcesService.getResourcesGrouped();
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':id/full-content')
  async getFullContent(@Param('id') id: string) {
    return this.resourcesService.getFullContent(id);
  }

  @UseInterceptors(CacheInterceptor)
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async getResource(@GetUser() user: any, @Param('id') id: string) {
    return this.resourcesService.getResourceById(id, user);
  }

  @Put(':id/like')
  async likeResource(@Param('id') id: string) {
    return this.resourcesService.likeResource(id);
  }

  @Put(':id/download')
  async incrementDownload(@Param('id') id: string) {
    return this.resourcesService.incrementDownload(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'resource_poster')
  @Post()
  async createResource(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createResourceDto: CreateResourceDto,
  ) {
    return this.resourcesService.createResource(
      createResourceDto,
      userId,
      userRole,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'resource_poster')
  @Put(':id')
  async updateResource(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.updateResource(
      id,
      updateResourceDto,
      userId,
      userRole,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'resource_poster')
  @Delete(':id')
  async deleteResource(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
  ) {
    return this.resourcesService.deleteResource(id, userId, userRole);
  }
}
