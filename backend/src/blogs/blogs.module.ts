import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { BlogsService } from './blogs.service';
import { BlogFetchService } from './blog-fetch.service';
import { BlogsController } from './blogs.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    UsersModule,
    AuthModule,
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogFetchService],
  exports: [BlogsService, BlogFetchService],
})
export class BlogsModule {}
