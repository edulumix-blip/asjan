import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const escapeRegex = (s: string) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class CoursesService {
  private readonly COURSE_CATEGORY_ENUM = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cybersecurity',
    'Cloud Computing',
    'UI/UX Design',
    'Digital Marketing',
    'Interview Prep',
    'DSA',
    'Programming Languages',
    'Others',
  ];

  private readonly COURSE_LEVEL_ENUM = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'All Levels',
  ];
  private readonly COURSE_LANGUAGE_ENUM = [
    'English',
    'Hindi',
    'Bengali',
    'Tamil',
    'Telugu',
    'Others',
  ];

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async getCourses(queryParams: any) {
    const {
      category,
      level,
      language,
      search,
      isFree,
      isFeatured,
      page = 1,
      limit = 12,
    } = queryParams;

    const query: any = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (level && level !== 'All') query.level = level;
    if (language && language !== 'All') query.language = language;
    if (isFree !== undefined && isFree !== '' && isFree !== 'All') {
      query.isFree = isFree === 'true';
    }
    if (isFeatured === 'true') query.isFeatured = true;

    const searchTrim = search && String(search).trim().slice(0, 120);
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), 'i');
      query.$or = [
        { title: { $regex: rx } },
        { description: { $regex: rx } },
        { tags: { $regex: rx } },
      ];
    }

    const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 100);
    const pg = Math.max(Number.parseInt(page, 10) || 1, 1);

    const courses = await this.courseModel
      .find(query)
      .populate('postedBy', 'name avatar')
      .select('-lessons.videoUrl')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.courseModel.countDocuments(query).exec();

    return {
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / lim) || 1,
      currentPage: pg,
      data: courses,
    };
  }

  async getCourseFilterOptions() {
    const base = { isPublished: true };
    const [cats, levels, langs] = await Promise.all([
      this.courseModel.distinct('category', base),
      this.courseModel.distinct('level', base),
      this.courseModel.distinct('language', base),
    ]);

    const categories = this.COURSE_CATEGORY_ENUM.filter((c) =>
      cats.includes(c),
    );
    for (const c of cats.sort((a, b) => a.localeCompare(b))) {
      if (!categories.includes(c)) categories.push(c);
    }

    const levelOptions = this.COURSE_LEVEL_ENUM.filter((l) =>
      levels.includes(l),
    );
    for (const l of levels.sort((a, b) => a.localeCompare(b))) {
      if (!levelOptions.includes(l)) levelOptions.push(l);
    }

    const languageOptions = this.COURSE_LANGUAGE_ENUM.filter((l) =>
      langs.includes(l),
    );
    for (const l of langs.sort((a, b) => a.localeCompare(b))) {
      if (!languageOptions.includes(l)) languageOptions.push(l);
    }

    return {
      success: true,
      data: {
        categories,
        levels: levelOptions,
        languages: languageOptions,
      },
    };
  }

  async getAllCourses(queryParams: any) {
    const {
      category,
      level,
      isPublished,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = queryParams;

    const query: any = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const lim = Number.parseInt(limit, 10) || 20;
    const pg = Number.parseInt(page, 10) || 1;

    const courses = await this.courseModel
      .find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.courseModel.countDocuments(query).exec();

    // Stats aggregation
    const [statsResult] = await this.courseModel
      .aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            published: [{ $match: { isPublished: true } }, { $count: 'count' }],
            drafts: [{ $match: { isPublished: false } }, { $count: 'count' }],
            featured: [{ $match: { isFeatured: true } }, { $count: 'count' }],
            free: [{ $match: { isFree: true } }, { $count: 'count' }],
            totalViews: [{ $group: { _id: null, total: { $sum: '$views' } } }],
            totalEnrollments: [
              { $group: { _id: null, total: { $sum: '$enrollments' } } },
            ],
          },
        },
      ])
      .exec();

    const stats = {
      total: statsResult.total[0]?.count || 0,
      published: statsResult.published[0]?.count || 0,
      drafts: statsResult.drafts[0]?.count || 0,
      featured: statsResult.featured[0]?.count || 0,
      free: statsResult.free[0]?.count || 0,
      totalViews: statsResult.totalViews[0]?.total || 0,
      totalEnrollments: statsResult.totalEnrollments[0]?.total || 0,
    };

    return {
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      stats,
      data: courses,
    };
  }

  async getFeaturedCourses() {
    const courses = await this.courseModel
      .find({ isPublished: true, isFeatured: true })
      .populate('postedBy', 'name avatar')
      .select('-lessons.videoUrl')
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();

    return {
      success: true,
      count: courses.length,
      data: courses,
    };
  }

  async getCourseBySlug(slug: string) {
    const course = await this.courseModel
      .findOne({ slug, isPublished: true })
      .populate('postedBy', 'name email avatar')
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Increment views
    course.views += 1;
    await course.save();

    return {
      success: true,
      data: course,
    };
  }

  async getCourseById(id: string) {
    const course = await this.courseModel
      .findById(id)
      .populate('postedBy', 'name email avatar')
      .exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      success: true,
      data: course,
    };
  }

  async createCourse(createCourseDto: CreateCourseDto, userId: string) {
    const course = await this.courseModel.create({
      ...createCourseDto,
      postedBy: new Types.ObjectId(userId),
    });

    return {
      success: true,
      message: 'Course created successfully!',
      data: course,
    };
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const updateData: any = { ...updateCourseDto };

    // Recalculate totals if lessons are updated
    if (updateData.lessons) {
      updateData.totalLessons = updateData.lessons.length;
      updateData.totalDuration = updateData.lessons.reduce(
        (acc: number, lesson: any) => acc + (lesson.duration || 0),
        0,
      );
    }

    Object.assign(course, updateData);
    await course.save();

    return {
      success: true,
      message: 'Course updated successfully',
      data: course,
    };
  }

  async deleteCourse(id: string) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.courseModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  async togglePublish(id: string) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.isPublished = !course.isPublished;
    await course.save();

    return {
      success: true,
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      data: course,
    };
  }

  async toggleFeatured(id: string) {
    const course = await this.courseModel.findById(id).exec();

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    course.isFeatured = !course.isFeatured;
    await course.save();

    return {
      success: true,
      message: `Course ${course.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: course,
    };
  }

  async getCoursesCount() {
    const count = await this.courseModel
      .countDocuments({ isPublished: true })
      .exec();
    return {
      success: true,
      count,
    };
  }
}
