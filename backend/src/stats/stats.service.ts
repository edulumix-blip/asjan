import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import {
  Resource,
  ResourceDocument,
} from '../resources/schemas/resource.schema';
import { Blog, BlogDocument } from '../blogs/schemas/blog.schema';
import { Course, CourseDocument } from '../courses/schemas/course.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async getPlatformStats() {
    const [
      totalUsers,
      approvedUsers,
      totalJobs,
      totalResources,
      totalCourses,
      totalBlogs,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel
        .countDocuments({ status: 'approved', role: { $ne: 'super_admin' } })
        .exec(),
      this.jobModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
      this.resourceModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
      this.courseModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
      this.blogModel.countDocuments({ isDeleted: { $ne: true } }).exec(),
    ]);

    return {
      success: true,
      data: {
        happyUsers: totalUsers,
        contributors: approvedUsers,
        jobsPosted: totalJobs,
        techResources: totalResources,
        courses: totalCourses,
        techBlogs: totalBlogs,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
