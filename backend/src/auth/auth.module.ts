import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { Otp, OtpSchema } from './schemas/otp.schema';
import { MailerService } from './services/mailer.service';

@Global()
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailerService, JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard],
  exports: [
    AuthService,
    MailerService,
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
