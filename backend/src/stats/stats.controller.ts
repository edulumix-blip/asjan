import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { TaskTrackerService } from '../utils/task-tracker.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('stats')
export class StatsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly taskTrackerService: TaskTrackerService,
  ) {}

  @Get('platform')
  async getPlatformStats() {
    return this.statsService.getPlatformStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('tasks')
  async getTasksStatus() {
    return this.taskTrackerService.getTasks();
  }
}
