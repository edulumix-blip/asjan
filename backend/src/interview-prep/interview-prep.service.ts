import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewPrep } from './schemas/interview-prep.schema';
import { CreateInterviewPrepDto } from './dto/create-interview-prep.dto';
import { UpdateInterviewPrepDto } from './dto/update-interview-prep.dto';

@Injectable()
export class InterviewPrepService {
  constructor(
    @InjectModel(InterviewPrep.name)
    private readonly interviewPrepModel: Model<InterviewPrep>,
  ) {}

  async findAll(query: any): Promise<InterviewPrep[]> {
    const filters: any = {};
    
    if (query.category && query.category !== 'All') {
      filters.category = query.category;
    }
    
    if (query.search) {
      filters.$text = { $search: query.search };
    }

    return this.interviewPrepModel
      .find(filters)
      .populate('postedBy', 'name email avatar role')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<InterviewPrep> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }
    const item = await this.interviewPrepModel
      .findById(id)
      .populate('postedBy', 'name email avatar role')
      .exec();
      
    if (!item) {
      throw new NotFoundException('Interview Prep question not found');
    }
    return item;
  }

  async create(dto: CreateInterviewPrepDto, userId: string): Promise<InterviewPrep> {
    const newItem = new this.interviewPrepModel({
      ...dto,
      postedBy: new Types.ObjectId(userId),
    });
    const saved = await newItem.save();
    return this.findById(saved._id.toString());
  }

  async update(id: string, dto: UpdateInterviewPrepDto): Promise<InterviewPrep> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }
    const updated = await this.interviewPrepModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Interview Prep question not found');
    }
    return this.findById(id);
  }

  async delete(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID format');
    }
    const deleted = await this.interviewPrepModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Interview Prep question not found');
    }
    return { success: true, message: 'Question deleted successfully' };
  }
}
