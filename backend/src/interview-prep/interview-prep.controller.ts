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
import { InterviewPrepService } from './interview-prep.service';
import { CreateInterviewPrepDto } from './dto/create-interview-prep.dto';
import { UpdateInterviewPrepDto } from './dto/update-interview-prep.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('interview-prep')
export class InterviewPrepController {
  constructor(private readonly interviewPrepService: InterviewPrepService) {}

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.interviewPrepService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.interviewPrepService.findById(id);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Post()
  async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateInterviewPrepDto,
  ) {
    const data = await this.interviewPrepService.create(dto, userId);
    return { success: true, data, message: 'Question created successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewPrepDto,
  ) {
    const data = await this.interviewPrepService.update(id, dto);
    return { success: true, data, message: 'Question updated successfully' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.interviewPrepService.delete(id);
  }
}
