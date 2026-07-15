import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { UsersService } from '../users/users.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getJobs(userPayload: any, queryParams: any) {
    const {
      category,
      status,
      experience,
      search,
      page = 1,
      limit = 12,
      postedBy,
      location: locationFilter,
      city,
    } = queryParams;

    const clauses: any[] = [];

    // Public/contributors should not see soft-deleted jobs
    // Super admin can see all jobs (including soft-deleted)
    if (!userPayload || userPayload.role !== 'super_admin') {
      clauses.push({ isDeleted: { $ne: true } });
    }

    if (category && category !== 'All') clauses.push({ category });
    if (status && status !== 'All') clauses.push({ status });
    if (experience && experience !== 'All') clauses.push({ experience });

    const locExact = locationFilter && String(locationFilter).trim();
    if (locExact && locExact !== 'All') {
      clauses.push({ location: locExact });
    }

    const cityTrim = city && String(city).trim();
    if (cityTrim && cityTrim !== 'All') {
      const rx = new RegExp(`^${escapeRegex(cityTrim)}(\\s*,|$)`, 'i');
      clauses.push({ location: { $regex: rx } });
    }

    if (postedBy && userPayload?.role === 'super_admin') {
      clauses.push({ postedBy });
    }

    const searchTrim = search && String(search).trim().slice(0, 120);
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), 'i');
      clauses.push({
        $or: [
          { title: { $regex: rx } },
          { company: { $regex: rx } },
          { location: { $regex: rx } },
        ],
      });
    }

    const query =
      clauses.length === 0
        ? {}
        : clauses.length === 1
          ? clauses[0]
          : { $and: clauses };

    const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 100);
    const pg = Math.max(Number.parseInt(page, 10) || 1, 1);

    const jobs = await this.jobModel
      .find(query)
      .populate('postedBy', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.jobModel.countDocuments(query).exec();

    return {
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / lim) || 1,
      currentPage: pg,
      data: jobs,
    };
  }

  async getJobFilterOptions(userPayload: any) {
    const base =
      !userPayload || userPayload.role !== 'super_admin'
        ? { isDeleted: { $ne: true } }
        : {};

    const [locations, experiencesInDb] = await Promise.all([
      this.jobModel.distinct('location', base),
      this.jobModel.distinct('experience', base),
    ]);

    const locList = locations
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'en'));
    const locationsCapped = locList.slice(0, 300);

    const expOrder = [
      'Fresher',
      '1 Year',
      '2 Years',
      '3 Years',
      '4 Years',
      '5+ Years',
    ];
    const experiences = expOrder.filter((e) => experiencesInDb.includes(e));

    const citySet = new Set<string>();
    for (const loc of locList) {
      const part = String(loc).split(',')[0].trim();
      if (part) citySet.add(part);
    }
    const cities = [...citySet]
      .sort((a, b) => a.localeCompare(b, 'en'))
      .slice(0, 250);

    return {
      success: true,
      data: {
        locations: locationsCapped,
        cities,
        experiences,
      },
    };
  }

  async getJobStats(userPayload: any) {
    const baseQuery =
      !userPayload || userPayload.role !== 'super_admin'
        ? { isDeleted: { $ne: true } }
        : {};

    const total = await this.jobModel.countDocuments(baseQuery).exec();

    const data: any = { total };
    if (userPayload?.role === 'super_admin') {
      data.open = await this.jobModel
        .countDocuments({ ...baseQuery, status: 'Open' })
        .exec();
      data.closed = await this.jobModel
        .countDocuments({ ...baseQuery, status: 'Closed' })
        .exec();
      const viewsAgg = await this.jobModel
        .aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              totalViews: { $sum: { $ifNull: ['$views', 0] } },
            },
          },
        ])
        .exec();
      data.totalViews = viewsAgg[0]?.totalViews ?? 0;
    }

    return {
      success: true,
      data,
    };
  }

  async getJobsGrouped(userPayload: any) {
    const categories = [
      'IT Job',
      'Non IT Job',
      'Walk In Drive',
      'Govt Job',
      'Internship',
      'Part Time Job',
      'Remote Job',
      'Others',
    ];

    const groupedJobs: any = {};
    const baseQuery =
      !userPayload || userPayload.role !== 'super_admin'
        ? { isDeleted: { $ne: true } }
        : {};

    for (const category of categories) {
      const jobs = await this.jobModel
        .find({ ...baseQuery, category })
        .populate('postedBy', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(6)
        .exec();

      if (jobs.length > 0) {
        groupedJobs[category] = {
          jobs,
          total: await this.jobModel
            .countDocuments({ ...baseQuery, category })
            .exec(),
        };
      }
    }

    return {
      success: true,
      data: groupedJobs,
    };
  }

  async getJobById(id: string, userPayload: any) {
    const job = await this.jobModel
      .findById(id)
      .populate('postedBy', 'name email avatar role')
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.isDeleted && (!userPayload || userPayload.role !== 'super_admin')) {
      throw new NotFoundException('Job not found');
    }

    // Increment views
    job.views += 1;
    await job.save();

    return {
      success: true,
      data: job,
    };
  }

  async getJobBySlug(slug: string, userPayload: any) {
    const job = await this.jobModel
      .findOne({ slug })
      .populate('postedBy', 'name email avatar role')
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.isDeleted && (!userPayload || userPayload.role !== 'super_admin')) {
      throw new NotFoundException('Job not found');
    }

    // Increment views
    job.views += 1;
    await job.save();

    return {
      success: true,
      data: job,
    };
  }

  async createJob(
    createJobDto: CreateJobDto,
    userId: string,
    userRole: string,
  ) {
    const job = await this.jobModel.create({
      ...createJobDto,
      postedBy: new Types.ObjectId(userId),
    });

    // Add 1 point to user (except super_admin)
    if (userRole !== 'super_admin') {
      try {
        await this.usersService.incrementPoints(userId, 1);
      } catch (pointsError) {
        console.error('Error updating points:', pointsError);
      }
    }

    return {
      success: true,
      message: 'Job posted successfully. You earned 1 point!',
      data: job,
    };
  }

  async updateJob(
    id: string,
    updateJobDto: UpdateJobDto,
    userId: string,
    userRole: string,
  ) {
    let job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership (unless super_admin)
    if (job.postedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to update this job');
    }

    job = await this.jobModel
      .findByIdAndUpdate(id, updateJobDto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    return {
      success: true,
      message: 'Job updated successfully',
      data: job,
    };
  }

  async deleteJob(id: string, userId: string, userRole: string) {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check ownership (unless super_admin)
    if (job.postedBy.toString() !== userId && userRole !== 'super_admin') {
      throw new ForbiddenException('Not authorized to delete this job');
    }

    // Super admin: Permanently delete
    if (userRole === 'super_admin') {
      await this.jobModel.findByIdAndDelete(id).exec();
      return {
        success: true,
        message: 'Job permanently deleted',
      };
    }

    // Contributor: Soft delete
    job.isDeleted = true;
    job.deletedAt = new Date();
    await job.save();

    // Deduct 1 point from user (except super_admin)
    if (userRole !== 'super_admin') {
      try {
        await this.usersService.incrementPoints(job.postedBy.toString(), -1);
      } catch (pointsError) {
        console.error('Error updating points:', pointsError);
      }
    }

    return {
      success: true,
      message: 'Job deleted successfully. 1 point deducted.',
    };
  }

  async likeJob(id: string, userId: string | null) {
    const job = await this.jobModel.findById(id).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    let liked: boolean | null = null;

    if (userId) {
      const hasLiked = job.likes.some((likeId) => likeId.toString() === userId);
      if (hasLiked) {
        // Unlike
        job.likes = job.likes.filter((likeId) => likeId.toString() !== userId);
        job.likesCount = Math.max(0, job.likesCount - 1);
        liked = false;
      } else {
        // Like
        job.likes.push(new Types.ObjectId(userId));
        job.likesCount += 1;
        liked = true;
      }
    } else {
      // Anonymous like
      job.likesCount += 1;
    }

    await job.save();

    return {
      success: true,
      likesCount: job.likesCount,
      liked,
    };
  }

  async getMyJobs(userId: string) {
    const jobs = await this.jobModel
      .find({ postedBy: new Types.ObjectId(userId), isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: jobs.length,
      data: jobs,
    };
  }
}
