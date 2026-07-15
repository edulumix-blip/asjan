import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JobsModule } from './jobs/jobs.module';
import { ResourcesModule } from './resources/resources.module';
import { BlogsModule } from './blogs/blogs.module';
import { CoursesModule } from './courses/courses.module';
import { MocktestsModule } from './mocktests/mocktests.module';
import { ProductsModule } from './products/products.module';
import { ClaimsModule } from './claims/claims.module';
import { ChatModule } from './chat/chat.module';
import { StatsModule } from './stats/stats.module';
import { TaskTrackerModule } from './utils/task-tracker.module';
import { SyncLogsModule } from './sync-logs/sync-logs.module';
import { ResumeAnalyzerModule } from './resume-analyzer/resume-analyzer.module';

import { Blog, BlogSchema } from './blogs/schemas/blog.schema';
import { Job, JobSchema } from './jobs/schemas/job.schema';
import { Resource, ResourceSchema } from './resources/schemas/resource.schema';
import { Course, CourseSchema } from './courses/schemas/course.schema';
import { MockTest, MockTestSchema } from './mocktests/schemas/mocktest.schema';
import {
  DigitalProduct,
  DigitalProductSchema,
} from './products/schemas/product.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes in milliseconds
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20,
    }]),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Job.name, schema: JobSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: Course.name, schema: CourseSchema },
      { name: MockTest.name, schema: MockTestSchema },
      { name: DigitalProduct.name, schema: DigitalProductSchema },
    ]),
    UsersModule,
    AuthModule,
    JobsModule,
    ResourcesModule,
    BlogsModule,
    CoursesModule,
    MocktestsModule,
    ProductsModule,
    ClaimsModule,
    ChatModule,
    StatsModule,
    TaskTrackerModule,
    SyncLogsModule,
    ResumeAnalyzerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
