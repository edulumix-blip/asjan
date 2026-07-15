import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { JobsService } from './jobs.service';
import { JobFetchService } from './job-fetch.service';
import { JobsController } from './jobs.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    UsersModule,
    AuthModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobFetchService],
  exports: [JobsService, JobFetchService],
})
export class JobsModule {}
