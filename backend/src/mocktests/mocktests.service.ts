import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MockTest, MockTestDocument } from './schemas/mocktest.schema';
import { CreateMockTestDto } from './dto/create-mocktest.dto';
import { UpdateMockTestDto } from './dto/update-mocktest.dto';

const escapeRegex = (s: string) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class MocktestsService {
  private readonly MOCK_TEST_CATEGORY_ENUM = [
    'Aptitude',
    'Logical Reasoning',
    'Verbal Ability',
    'Technical - Programming',
    'Technical - DSA',
    'Technical - DBMS',
    'Technical - OS',
    'Technical - CN',
    'Technical - Web Dev',
    'Company Specific',
    'Gate',
    'Government Exams',
    'Placement Prep',
    'Competitive Exams',
    'Others',
  ];

  private readonly MOCK_TEST_DIFFICULTY_ENUM = [
    'Easy',
    'Medium',
    'Hard',
    'Mixed',
  ];

  constructor(
    @InjectModel(MockTest.name)
    private readonly mockTestModel: Model<MockTestDocument>,
  ) {}

  async getMockTests(queryParams: any) {
    const {
      category,
      difficulty,
      company,
      search,
      isFree,
      isFeatured,
      page = 1,
      limit = 12,
    } = queryParams;

    const query: any = { isPublished: true };

    if (category && category !== 'All') query.category = category;
    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;

    const companyTrim = company && String(company).trim();
    if (companyTrim && companyTrim !== 'All') {
      query.company = new RegExp(`^${escapeRegex(companyTrim)}$`, 'i');
    }

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
        { company: { $regex: rx } },
      ];
    }

    const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 12, 1), 100);
    const pg = Math.max(Number.parseInt(page, 10) || 1, 1);

    const tests = await this.mockTestModel
      .find(query)
      .populate('postedBy', 'name avatar')
      .select('-questions')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.mockTestModel.countDocuments(query).exec();

    return {
      success: true,
      count: tests.length,
      total,
      totalPages: Math.ceil(total / lim) || 1,
      currentPage: pg,
      data: tests,
    };
  }

  async getMockTestFilterOptions() {
    const base = { isPublished: true };
    const [cats, companiesRaw] = await Promise.all([
      this.mockTestModel.distinct('category', base),
      this.mockTestModel.distinct('company', base),
    ]);

    const categories = this.MOCK_TEST_CATEGORY_ENUM.filter((c) =>
      cats.includes(c),
    );
    for (const c of cats.sort((a, b) => a.localeCompare(b))) {
      if (!categories.includes(c)) categories.push(c);
    }

    const companySet = new Set<string>();
    for (const c of companiesRaw) {
      const t = String(c || '').trim();
      if (t) companySet.add(t);
    }
    const companies = [...companySet]
      .sort((a, b) => a.localeCompare(b, 'en'))
      .slice(0, 150);

    return {
      success: true,
      data: {
        categories,
        difficulties: this.MOCK_TEST_DIFFICULTY_ENUM,
        companies,
      },
    };
  }

  async getAllMockTests(queryParams: any) {
    const {
      category,
      difficulty,
      isPublished,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = queryParams;

    const query: any = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const lim = Number.parseInt(limit, 10) || 20;
    const pg = Number.parseInt(page, 10) || 1;

    const tests = await this.mockTestModel
      .find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.mockTestModel.countDocuments(query).exec();

    // Stats aggregation
    const [statsResult] = await this.mockTestModel
      .aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            published: [{ $match: { isPublished: true } }, { $count: 'count' }],
            drafts: [{ $match: { isPublished: false } }, { $count: 'count' }],
            featured: [{ $match: { isFeatured: true } }, { $count: 'count' }],
            free: [{ $match: { isFree: true } }, { $count: 'count' }],
            totalViews: [{ $group: { _id: null, total: { $sum: '$views' } } }],
            totalAttempts: [
              { $group: { _id: null, total: { $sum: '$attempts' } } },
            ],
            totalQuestions: [
              { $group: { _id: null, total: { $sum: '$totalQuestions' } } },
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
      totalAttempts: statsResult.totalAttempts[0]?.total || 0,
      totalQuestions: statsResult.totalQuestions[0]?.total || 0,
    };

    return {
      success: true,
      count: tests.length,
      total,
      totalPages: Math.ceil(total / lim),
      currentPage: pg,
      stats,
      data: tests,
    };
  }

  async getFeaturedMockTests() {
    const tests = await this.mockTestModel
      .find({ isPublished: true, isFeatured: true })
      .populate('postedBy', 'name avatar')
      .select('-questions')
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();

    return {
      success: true,
      count: tests.length,
      data: tests,
    };
  }

  async getMockTestBySlug(slug: string) {
    const test = await this.mockTestModel
      .findOne({ slug, isPublished: true })
      .populate('postedBy', 'name email avatar')
      .exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    // Increment views
    test.views += 1;
    await test.save();

    return {
      success: true,
      data: test,
    };
  }

  async getMockTestById(id: string) {
    const test = await this.mockTestModel
      .findById(id)
      .populate('postedBy', 'name email avatar')
      .exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    return {
      success: true,
      data: test,
    };
  }

  async createMockTest(createMockTestDto: CreateMockTestDto, userId: string) {
    const testData: any = {
      ...createMockTestDto,
      postedBy: new Types.ObjectId(userId),
    };

    // Calculate totals
    if (testData.questions && testData.questions.length > 0) {
      testData.totalQuestions = testData.questions.length;
      testData.totalMarks = testData.questions.reduce(
        (acc: number, q: any) => acc + (q.marks || 1),
        0,
      );
      if (!testData.passingMarks) {
        testData.passingMarks = Math.ceil(testData.totalMarks * 0.4);
      }
    }

    const test = await this.mockTestModel.create(testData);

    return {
      success: true,
      message: 'Mock test created successfully!',
      data: test,
    };
  }

  async updateMockTest(id: string, updateMockTestDto: UpdateMockTestDto) {
    const test = await this.mockTestModel.findById(id).exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    const updateData: any = { ...updateMockTestDto };

    // Recalculate totals if questions are updated
    if (updateData.questions) {
      updateData.totalQuestions = updateData.questions.length;
      updateData.totalMarks = updateData.questions.reduce(
        (acc: number, q: any) => acc + (q.marks || 1),
        0,
      );
    }

    const updatedTest = await this.mockTestModel
      .findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    return {
      success: true,
      message: 'Mock test updated successfully',
      data: updatedTest,
    };
  }

  async deleteMockTest(id: string) {
    const test = await this.mockTestModel.findById(id).exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    await this.mockTestModel.findByIdAndDelete(id).exec();

    return {
      success: true,
      message: 'Mock test deleted successfully',
    };
  }

  async togglePublish(id: string) {
    const test = await this.mockTestModel.findById(id).exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    test.isPublished = !test.isPublished;
    await test.save();

    return {
      success: true,
      message: `Mock test ${test.isPublished ? 'published' : 'unpublished'} successfully`,
      data: test,
    };
  }

  async toggleFeatured(id: string) {
    const test = await this.mockTestModel.findById(id).exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    test.isFeatured = !test.isFeatured;
    await test.save();

    return {
      success: true,
      message: `Mock test ${test.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: test,
    };
  }

  async submitTestResult(id: string, score: number) {
    if (!Number.isFinite(score) || score < 0) {
      throw new BadRequestException('Valid score is required');
    }
    const test = await this.mockTestModel.findById(id).exec();

    if (!test) {
      throw new NotFoundException('Mock test not found');
    }

    if (score > test.totalMarks) {
      throw new BadRequestException('Submitted score exceeds total marks of the test');
    }

    // Update attempts and average score
    const newAttempts = test.attempts + 1;
    const newAvgScore = (test.avgScore * test.attempts + score) / newAttempts;

    test.attempts = newAttempts;
    test.avgScore = Math.round(newAvgScore * 100) / 100;
    await test.save();

    return {
      success: true,
      message: 'Test result submitted',
      data: {
        score,
        totalMarks: test.totalMarks,
        passed: score >= test.passingMarks,
        passingMarks: test.passingMarks,
      },
    };
  }

  async getMockTestsCount() {
    const count = await this.mockTestModel
      .countDocuments({ isPublished: true })
      .exec();
    return {
      success: true,
      count,
    };
  }
}
