import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
import { Blog, BlogSchema } from '../blogs/schemas/blog.schema';
import { Course, CourseSchema } from '../courses/schemas/course.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Job.name, schema: JobSchema },
      { name: Resource.name, schema: ResourceSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
