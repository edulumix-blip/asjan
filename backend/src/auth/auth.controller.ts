import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Post,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.login(loginDto);
    if (result.success && result.data?.id) {
      const refreshToken = this.authService.generateRefreshToken(result.data.id.toString());
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const rawCookies = req.headers.cookie;
    const cookies = rawCookies
      ?.split(';')
      .reduce((acc, c) => {
        const [key, val] = c.trim().split('=');
        acc[key] = val;
        return acc;
      }, {} as Record<string, string>);
    const refreshToken = cookies?.refresh_token;

    if (!refreshToken) {
      return { success: false, message: 'Refresh token missing' };
    }

    try {
      const payload = await this.authService.verifyRefreshToken(refreshToken);
      const newAccessToken = this.authService.generateToken(payload.id);
      const newRefreshToken = this.authService.generateRefreshToken(payload.id);

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return {
        success: true,
        token: newAccessToken,
      };
    } catch (err) {
      return { success: false, message: 'Invalid refresh token' };
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @GetUser('id') userId: string,
    @Body() profileDto: ProfileUpdateDto,
  ) {
    return this.authService.updateProfile(userId, profileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async changePassword(
    @GetUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
