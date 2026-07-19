import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewPrepController } from './interview-prep.controller';
import { InterviewPrepService } from './interview-prep.service';
import { InterviewPrep, InterviewPrepSchema } from './schemas/interview-prep.schema';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InterviewPrep.name, schema: InterviewPrepSchema },
    ]),
    UsersModule,
    AuthModule,
  ],
  controllers: [InterviewPrepController],
  providers: [InterviewPrepService],
  exports: [InterviewPrepService],
})
export class InterviewPrepModule {}
