import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DigitalProduct,
  DigitalProductDocument,
} from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UsersService } from '../users/users.service';

const escapeRegex = (s: string) =>
  String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Injectable()
export class ProductsService {
  private readonly DIGITAL_PRODUCT_CATEGORY_ENUM = [
    'AI Tools',
    'Design & Creative',
    'Entertainment & Streaming',
    'Productivity & Office',
    'Security & Utility',
    'Education & Learning',
    'Others',
  ];

  constructor(
    @InjectModel(DigitalProduct.name)
    private readonly productModel: Model<DigitalProductDocument>,
    private readonly usersService: UsersService,
  ) {}

  private getSortAndPaginateStages(skip: number, limit: number): any[] {
    const stages: any[] = [
      {
        $addFields: {
          _isSeed: {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ['$externalId', ''] },
                  regex: '^edulumix-digital-seed-',
                },
              },
              1,
              0,
            ],
          },
        },
      },
      { $sort: { _isSeed: 1, createdAt: -1 } },
    ];
    if (skip > 0) stages.push({ $skip: skip });
    if (limit > 0) stages.push({ $limit: limit });
    return stages;
  }

  private getPostedByLookupStages(userProject: any): any[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: '_postedByUser',
          pipeline: [{ $project: userProject }],
        },
      },
      { $set: { postedBy: { $arrayElemAt: ['$_postedByUser', 0] } } },
      { $unset: ['_postedByUser', '_isSeed'] },
    ];
  }

  async getProducts(queryParams: any) {
    const {
      category,
      subcategory,
      search,
      isFeatured,
      page = 1,
      limit = 12,
    } = queryParams;

    const query: any = { isAvailable: true };

    if (category && category !== 'All') query.category = category;
    const subTrim = subcategory && String(subcategory).trim();
    if (subTrim && subTrim !== 'All') query.subcategory = subTrim;
    if (isFeatured === 'true') query.isFeatured = true;

    const searchTrim = search && String(search).trim().slice(0, 120);
    if (searchTrim) {
      const rx = new RegExp(escapeRegex(searchTrim), 'i');
      query.$or = [
        { name: { $regex: rx } },
        { description: { $regex: rx } },
        { subcategory: { $regex: rx } },
      ];
    }

    const limitNum = Math.max(1, Number.parseInt(limit, 10) || 12);
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: query },
      ...this.getSortAndPaginateStages(skip, limitNum),
      ...this.getPostedByLookupStages({ name: 1, avatar: 1 }),
    ];

    const products = await this.productModel.aggregate(pipeline).exec();
    const total = await this.productModel.countDocuments(query).exec();

    return {
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: products,
    };
  }

  async getProductFilterOptions() {
    const base = { isAvailable: true };
    const rawSubs = await this.productModel
      .distinct('subcategory', base)
      .exec();
    const subSet = new Set<string>();
    for (const s of rawSubs) {
      const t = String(s || '').trim();
      if (t) subSet.add(t);
    }
    const subcategories = [...subSet]
      .sort((a, b) => a.localeCompare(b, 'en'))
      .slice(0, 200);

    return {
      success: true,
      data: {
        categories: this.DIGITAL_PRODUCT_CATEGORY_ENUM,
        subcategories,
      },
    };
  }

  async getAllProducts(queryParams: any) {
    const {
      category,
      isAvailable,
      isFeatured,
      search,
      page = 1,
      limit = 20,
    } = queryParams;

    const query: any = {};

    if (category) query.category = category;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
      ];
    }

    const lim = Math.max(Number.parseInt(limit, 10) || 20, 1);
    const pg = Math.max(Number.parseInt(page, 10) || 1, 1);

    const products = await this.productModel
      .find(query)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(lim)
      .skip((pg - 1) * lim)
      .exec();

    const total = await this.productModel.countDocuments(query).exec();

    // Stats aggregation
    const [statsResult] = await this.productModel
      .aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            available: [{ $match: { isAvailable: true } }, { $count: 'count' }],
            unavailable: [
              { $match: { isAvailable: false } },
              { $count: 'count' },
            ],
            featured: [{ $match: { isFeatured: true } }, { $count: 'count' }],
            totalViews: [{ $group: { _id: null, total: { $sum: '$views' } } }],
          },
        },
      ])
      .exec();

    const stats = {
      total: statsResult.total[0]?.count || 0,
      available: statsResult.available[0]?.count || 0,
      unavailable: statsResult.unavailable[0]?.count || 0,
      featured: statsResult.featured[0]?.count || 0,
      totalViews: statsResult.totalViews[0]?.total || 0,
    };

    return {
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / lim) || 1,
      currentPage: pg,
      stats,
      data: products,
    };
  }

  async getFeaturedProducts() {
    const pipeline = [
      { $match: { isAvailable: true, isFeatured: true } },
      ...this.getSortAndPaginateStages(0, 8),
      ...this.getPostedByLookupStages({ name: 1, avatar: 1 }),
    ];

    const products = await this.productModel.aggregate(pipeline).exec();

    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  async getProductsByCategory(category: string) {
    const pipeline = [
      {
        $match: {
          category,
          isAvailable: true,
        },
      },
      ...this.getSortAndPaginateStages(0, 0),
      ...this.getPostedByLookupStages({ name: 1, avatar: 1 }),
    ];

    const products = await this.productModel.aggregate(pipeline).exec();

    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  async getProduct(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('postedBy', 'name email avatar')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.views += 1;
    await product.save();

    return {
      success: true,
      data: product,
    };
  }

  async createProduct(createProductDto: CreateProductDto, user: any) {
    const product = await this.productModel.create({
      ...createProductDto,
      postedBy: new Types.ObjectId(user.id),
    });

    if (user.role !== 'super_admin') {
      await this.usersService.incrementPoints(user.id, 1);
    }

    return {
      success: true,
      message: 'Product added successfully. You earned 1 point!',
      data: product,
    };
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    user: any,
  ) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.postedBy.toString() !== user.id &&
      user.role !== 'super_admin'
    ) {
      throw new ForbiddenException('Not authorized to update this product');
    }

    Object.assign(product, updateProductDto);
    await product.save();

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  }

  async deleteProduct(id: string, user: any) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.postedBy.toString() !== user.id &&
      user.role !== 'super_admin'
    ) {
      throw new ForbiddenException('Not authorized to delete this product');
    }

    await this.productModel.findByIdAndDelete(id).exec();

    if (user.role !== 'super_admin') {
      await this.usersService.incrementPoints(product.postedBy.toString(), -1);
    }

    return {
      success: true,
      message: 'Product deleted successfully. 1 point deducted.',
    };
  }

  async getMyProducts(userId: string) {
    const products = await this.productModel
      .find({ postedBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    return {
      success: true,
      count: products.length,
      data: products,
    };
  }

  async getProductsCount() {
    const count = await this.productModel
      .countDocuments({ isAvailable: true })
      .exec();
    return {
      success: true,
      count,
    };
  }

  async toggleAvailability(id: string) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return {
      success: true,
      message: `Product ${product.isAvailable ? 'made available' : 'made unavailable'}`,
      data: product,
    };
  }

  async toggleFeatured(id: string) {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    return {
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`,
      data: product,
    };
  }
}
