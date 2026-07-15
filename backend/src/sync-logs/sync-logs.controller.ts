import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SyncLogsService } from './sync-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('sync-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SyncLogsController {
  constructor(private readonly syncLogsService: SyncLogsService) {}

  @Get(':taskName')
  async getLogsByTask(@Param('taskName') taskName: string) {
    const data = await this.syncLogsService.getLogs(taskName);
    return {
      success: true,
      data,
    };
  }

  @Get('status/:id')
  async getLogStatus(@Param('id') id: string) {
    const data = await this.syncLogsService.getLogById(id);
    return {
      success: true,
      data,
    };
  }
}
