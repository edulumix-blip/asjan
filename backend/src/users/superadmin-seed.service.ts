import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminSeedService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const adminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('SUPER_ADMIN_PASSWORD');
    const adminName = this.configService.get<string>('SUPER_ADMIN_NAME') || 'Super Admin';

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  Super admin credentials missing from env variables. Skipping seeding.');
      return;
    }

    try {
      const existingAdmin = await this.userModel.findOne({ role: 'super_admin' }).exec();
      if (existingAdmin) {
        console.log('✅ Super admin already seeded.');
        return;
      }

      // Check if email already registered as another role
      const emailConflict = await this.userModel.findOne({ email: adminEmail.toLowerCase() }).exec();
      if (emailConflict) {
        console.warn(`⚠️  Cannot seed super admin: email ${adminEmail} is already registered under role: ${emailConflict.role}`);
        return;
      }

      // Create super admin. The password hashing hook on the schema will hash the password.
      await this.userModel.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'super_admin',
        status: 'approved',
      });

      console.log('🚀 Super admin seeded successfully!');
    } catch (err: any) {
      console.error('❌ Failed to seed super admin:', err.message || err);
    }
  }
}
