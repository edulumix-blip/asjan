import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { validatePasswordStrength } from '../utils/password-validation';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { MailerService } from './services/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { name, email, password, confirmPassword, role } = signupDto;

    // Validate password strength
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      throw new BadRequestException(pwdCheck.message);
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Check if user exists
    const userExists = await this.usersService.findOneByEmail(email);
    if (userExists) {
      throw new BadRequestException('User with this email already exists');
    }

    // Prevent creating super_admin via signup
    if (role === 'super_admin') {
      throw new ForbiddenException('Cannot create super admin account');
    }

    const VALID_SIGNUP_ROLES = [
      'resource_poster',
      'job_poster',
      'blog_poster',
      'tech_blog_poster',
      'digital_product_poster',
      'others',
    ];
    const userRole = (role && VALID_SIGNUP_ROLES.includes(role)) ? role : 'others';

    // Verify OTP state
    const otpRecord = await this.otpModel.findOne({
      email: email.toLowerCase(),
      verified: true,
    });
    if (!otpRecord) {
      throw new BadRequestException('Please verify your email via OTP first.');
    }

    // Create user with pending status
    const user = await this.usersService.create({
      name,
      email,
      password,
      role: userRole,
      status: 'pending',
    });

    // Delete OTP verification record upon successful registration
    await this.otpModel.deleteOne({ email: email.toLowerCase() });

    // Send registration pending email
    await this.mailerService.sendRegistrationPendingEmail(user.email, user.name, user.role);

    return {
      success: true,
      message:
        'Registration successful! Your request has been sent to admin for approval.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async sendOtp(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Check if user exists
    const userExists = await this.usersService.findOneByEmail(email);
    if (userExists) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/overwrite OTP in database (set verified: false)
    await this.otpModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, verified: false, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' },
    );

    // Send the email
    await this.mailerService.sendOtpEmail(email, otp);

    return {
      success: true,
      message: 'Verification OTP sent to your email address.',
    };
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new BadRequestException('Email and OTP are required');
    }

    // Find OTP record
    const otpRecord = await this.otpModel.findOne({ email: email.toLowerCase() });
    if (!otpRecord || otpRecord.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Set verified: true, remove otp, and reset createdAt to extend TTL
    await this.otpModel.updateOne(
      { email: email.toLowerCase() },
      { $set: { verified: true, otp: null, createdAt: new Date() } },
    );

    return {
      success: true,
      message: 'Email verified successfully! You can now complete your registration.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user and include password
    const user = await this.usersService.findOneByEmail(email, true);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isMatch = await (user as any).matchPassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check user status
    if (user.status === 'pending') {
      throw new ForbiddenException(
        'Your account is pending approval. Please wait for admin approval.',
      );
    }

    if (user.status === 'rejected') {
      throw new ForbiddenException(
        `Your account was rejected. Reason: ${user.rejectionReason || 'Not specified'}`,
      );
    }

    if (user.status === 'blocked') {
      throw new ForbiddenException(
        'Your account has been blocked. Please contact admin.',
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = this.generateToken(user._id.toString());

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        points: user.points,
        totalEarnings: user.totalEarnings,
        claimedMilestones: user.claimedMilestones || [],
        token,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        website: user.website,
        linkedin: user.linkedin,
        points: user.points,
        totalEarnings: user.totalEarnings,
        claimedMilestones: user.claimedMilestones || [],
        createdAt: (user as any).createdAt,
        lastLogin: user.lastLogin,
      },
    };
  }

  async updateProfile(userId: string, profileDto: ProfileUpdateDto) {
    const { name, bio, phone, avatar, location, website, linkedin } =
      profileDto;

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = name || user.name;
    user.bio = bio !== undefined ? bio : user.bio;
    user.phone = phone !== undefined ? phone : user.phone;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.location = location !== undefined ? location : user.location;
    user.website = website !== undefined ? website : user.website;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;

    const updatedUser = await user.save();

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        location: updatedUser.location,
        website: updatedUser.website,
        linkedin: updatedUser.linkedin,
        points: updatedUser.points,
        totalEarnings: updatedUser.totalEarnings,
        claimedMilestones: updatedUser.claimedMilestones || [],
        createdAt: (updatedUser as any).createdAt,
        lastLogin: updatedUser.lastLogin,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.usersService.findById(userId, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check current password
    const isMatch = await (user as any).matchPassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password strength
    const pwdCheck = validatePasswordStrength(newPassword);
    if (!pwdCheck.valid) {
      throw new BadRequestException(pwdCheck.message);
    }

    user.password = newPassword;
    await user.save();

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  generateToken(userId: string): string {
    return this.jwtService.sign({ id: userId });
  }

  generateRefreshToken(userId: string): string {
    const secret = this.configService.get<string>('JWT_SECRET') + '_refresh';
    return this.jwtService.sign({ id: userId }, { secret, expiresIn: '7d' });
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') + '_refresh';
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
