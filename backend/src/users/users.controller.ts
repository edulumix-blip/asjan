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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all-public')
  async getAllPublicUsers() {
    return this.usersService.getAllPublicUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('pending')
  async getPendingUsers() {
    return this.usersService.getPendingUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('approved')
  async getApprovedUsers() {
    return this.usersService.getApprovedUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('stats')
  async getDashboardStats() {
    return this.usersService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get()
  async getAllUsers(@Query() query: any) {
    return this.usersService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/approve')
  async approveUser(@Param('id') id: string) {
    return this.usersService.approveUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/reject')
  async rejectUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.rejectUser(id, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/block')
  async blockUser(@Param('id') id: string) {
    return this.usersService.blockUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.usersService.unblockUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id/role')
  async changeUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.changeUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
