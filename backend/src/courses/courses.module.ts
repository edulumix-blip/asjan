import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './schemas/course.schema';
import { CoursesService } from './courses.service';
import { CourseFetchService } from './course-fetch.service';
import { CoursesController } from './courses.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    UsersModule,
    AuthModule,
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CourseFetchService],
  exports: [CoursesService, CourseFetchService],
})
export class CoursesModule {}
