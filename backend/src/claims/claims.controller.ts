import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/user.decorator';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createClaim(
    @GetUser('id') userId: string,
    @Body() createClaimDto: CreateClaimDto,
  ) {
    return this.claimsService.createClaim(createClaimDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-claims')
  async getMyClaims(@GetUser('id') userId: string) {
    return this.claimsService.getMyClaims(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('stats')
  async getClaimStats() {
    return this.claimsService.getClaimStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get('pending/count')
  async getPendingClaimsCount() {
    return this.claimsService.getPendingClaimsCount();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Get()
  async getAllClaims(@Query() query: any) {
    return this.claimsService.getAllClaims(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @Put(':id')
  async updateClaim(
    @GetUser('id') adminId: string,
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
  ) {
    return this.claimsService.updateClaim(id, updateClaimDto, adminId);
  }
}
