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
import { MocktestsService } from './mocktests.service';
import { CreateMockTestDto } from './dto/create-mocktest.dto';
import { UpdateMockTestDto } from './dto/update-mocktest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('mocktests')
export class MocktestsController {
  constructor(private readonly mocktestsService: MocktestsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('all')
  async getAllMockTests(@Query() query: any) {
    return this.mocktestsService.getAllMockTests(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('id/:id')
  async getMockTestById(@Param('id') id: string) {
    return this.mocktestsService.getMockTestById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-publish')
  async togglePublish(@Param('id') id: string) {
    return this.mocktestsService.togglePublish(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/toggle-featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.mocktestsService.toggleFeatured(id);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async getMockTests(@Query() query: any) {
    return this.mocktestsService.getMockTests(query);
  }

  @UseInterceptors(CacheInterceptor)
  @Get('filter-options')
  async getMockTestFilterOptions() {
    return this.mocktestsService.getMockTestFilterOptions();
  }

  @UseInterceptors(CacheInterceptor)
  @Get('featured')
  async getFeaturedMockTests() {
    return this.mocktestsService.getFeaturedMockTests();
  }

  @Get('count')
  async getMockTestsCount() {
    return this.mocktestsService.getMockTestsCount();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post()
  async createMockTest(
    @GetUser('id') userId: string,
    @Body() createMockTestDto: CreateMockTestDto,
  ) {
    return this.mocktestsService.createMockTest(createMockTestDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id')
  async updateMockTest(
    @Param('id') id: string,
    @Body() updateMockTestDto: UpdateMockTestDto,
  ) {
    return this.mocktestsService.updateMockTest(id, updateMockTestDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Delete(':id')
  async deleteMockTest(@Param('id') id: string) {
    return this.mocktestsService.deleteMockTest(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submit')
  async submitTestResult(
    @Param('id') id: string,
    @Body('score') score: number,
  ) {
    return this.mocktestsService.submitTestResult(id, score);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':slug')
  async getMockTestBySlug(@Param('slug') slug: string) {
    return this.mocktestsService.getMockTestBySlug(slug);
  }
}
