import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MailerService } from '../auth/services/mailer.service';

@Injectable()
export class UsersService {
  private readonly VALID_ROLES = [
    'resource_poster',
    'job_poster',
    'blog_poster',
    'tech_blog_poster',
    'digital_product_poster',
    'others',
  ];

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async findOneByEmail(
    email: string,
    includePassword = false,
  ): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async findSuperAdmin(): Promise<UserDocument | null> {
    return this.userModel.findOne({ role: 'super_admin' }).exec();
  }


  async findById(id: string, includePassword = false): Promise<UserDocument | null> {
    const query = this.userModel.findById(id);
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(userData);
  }

  async update(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true })
      .exec();
  }

  async incrementPoints(
    userId: string,
    amount: number,
  ): Promise<UserDocument | null> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { points: amount } },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    if (user && user.points < 0) {
      user.points = 0;
      await user.save();
    }
    return user;
  }

  // --- Admin & Public Methods ---

  async getAllPublicUsers() {
    return this.userModel
      .find({ status: 'approved', role: { $ne: 'super_admin' } })
      .select('name role avatar status')
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();
  }

  async getPendingUsers() {
    const users = await this.userModel
      .find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: users.length,
      data: users,
    };
  }

  async getApprovedUsers() {
    const users = await this.userModel
      .find({
        status: { $in: ['approved', 'blocked'] },
        role: { $ne: 'super_admin' },
      })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: users.length,
      data: users,
    };
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      data: user,
    };
  }

  async getAllUsers(queryParams: any) {
    const { status, role, page = 1, limit = 10 } = queryParams;

    const query: any = { role: { $ne: 'super_admin' } };
    if (status) query.status = status;
    if (role) query.role = role;

    const lim = Number.parseInt(limit, 10) || 10;
    const pg = Number.parseInt(page, 10) || 1;

    const users = await this.userModel
      .find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.userModel.countDocuments(query).exec();

    return {
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      data: users,
    };
  }

  async approveUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot modify super admin');
    }

    user.status = 'approved';
    user.rejectionReason = '';
    await user.save();

    // Send account approved email
    await this.mailerService.sendAccountApprovedEmail(user.email, user.name);

    return {
      success: true,
      message: `User ${user.name} has been approved`,
      data: user,
    };
  }

  async rejectUser(id: string, reason: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot modify super admin');
    }

    user.status = 'rejected';
    user.rejectionReason = reason;
    await user.save();

    // Send account rejected email
    await this.mailerService.sendAccountRejectedEmail(user.email, user.name, reason);

    return {
      success: true,
      message: `User ${user.name} has been rejected`,
      data: user,
    };
  }

  async blockUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot block super admin');
    }

    user.status = 'blocked';
    await user.save();

    // Send account blocked email
    await this.mailerService.sendAccountBlockedEmail(user.email, user.name);

    return {
      success: true,
      message: `User ${user.name} has been blocked`,
      data: user,
    };
  }

  async unblockUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot unblock super admin');
    }

    user.status = 'approved';
    await user.save();

    // Send account unblocked email
    await this.mailerService.sendAccountUnblockedEmail(user.email, user.name);

    return {
      success: true,
      message: `User ${user.name} has been unblocked`,
      data: user,
    };
  }

  async changeUserRole(id: string, role: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot change super admin role');
    }

    if (role === 'super_admin') {
      throw new ForbiddenException('Cannot assign super admin role');
    }

    if (!role || !this.VALID_ROLES.includes(role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${this.VALID_ROLES.join(', ')}`,
      );
    }

    user.role = role;
    await user.save();

    return {
      success: true,
      message: `User role changed to ${role}`,
      data: user,
    };
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'super_admin') {
      throw new ForbiddenException('Cannot delete super admin');
    }

    await this.userModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async getDashboardStats() {
    const [totalUsers, pendingUsers, approvedUsers, blockedUsers, roleStats] =
      await Promise.all([
        this.userModel.countDocuments({ role: { $ne: 'super_admin' } }).exec(),
        this.userModel.countDocuments({ status: 'pending' }).exec(),
        this.userModel
          .countDocuments({ status: 'approved', role: { $ne: 'super_admin' } })
          .exec(),
        this.userModel.countDocuments({ status: 'blocked' }).exec(),
        this.userModel
          .aggregate([
            { $match: { role: { $ne: 'super_admin' } } },
            { $group: { _id: '$role', count: { $sum: 1 } } },
          ])
          .exec(),
      ]);

    return {
      success: true,
      data: {
        totalUsers,
        pendingUsers,
        approvedUsers,
        blockedUsers,
        roleStats,
      },
    };
  }
}
