import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Claim.name, schema: ClaimSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
