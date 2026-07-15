import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MockTest, MockTestSchema } from './schemas/mocktest.schema';
import { MocktestsService } from './mocktests.service';
import { MocktestsController } from './mocktests.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MockTest.name, schema: MockTestSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [MocktestsController],
  providers: [MocktestsService],
  exports: [MocktestsService],
})
export class MocktestsModule {}
