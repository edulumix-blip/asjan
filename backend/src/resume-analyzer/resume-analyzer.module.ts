import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { ResumeAnalyzerService } from './resume-analyzer.service';
import { ResumeAnalyzerController } from './resume-analyzer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
  ],
  controllers: [ResumeAnalyzerController],
  providers: [ResumeAnalyzerService],
  exports: [ResumeAnalyzerService],
})
export class ResumeAnalyzerModule {}
