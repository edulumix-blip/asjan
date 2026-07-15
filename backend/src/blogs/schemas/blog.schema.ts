import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  })
  title: string;

  @Prop({
    type: String,
    unique: true,
    lowercase: true,
  })
  slug: string;

  @Prop({ required: [true, 'Blog content is required'] })
  content: string;

  @Prop({
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters'],
  })
  excerpt: string;

  @Prop({
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  })
  shortDescription: string;

  @Prop({
    type: String,
    enum: [
      'Tech Blog',
      'Career Tips',
      'Interview Guide',
      'Tutorial',
      'News',
      'Trending Tech News',
      'Interesting Facts',
      'Daily Coding',
      'Software Developer',
      'Web Development',
      'AI & Machine Learning',
      'Mobile Development',
      'DevOps & Cloud',
      'Others',
    ],
    default: 'Others',
  })
  category: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];

  @Prop({
    type: String,
    default: '',
  })
  coverImage: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isPublished: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isFeatured: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isSponsored: boolean;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  sponsorName: string;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  sponsorLink: string;

  @Prop({
    type: Number,
    default: 0,
  })
  views: number;

  @Prop({
    type: Number,
    default: 0,
  })
  likes: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  author: Types.ObjectId;

  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt: Date;

  @Prop({
    type: String,
    enum: ['manual', 'devto', 'medium'],
    default: 'manual',
  })
  source: string;

  @Prop({
    type: String,
    default: '',
  })
  externalId: string;

  @Prop({
    type: String,
    default: '',
  })
  externalLink: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// Generate slug before saving
BlogSchema.pre('save', function (this: any) {
  if (this.isNew || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + (this._id || Date.now());
  }
});

// Indices
BlogSchema.index({ title: 'text', content: 'text', tags: 'text' });
BlogSchema.index({ author: 1, createdAt: -1 });
BlogSchema.index({ isPublished: 1, isDeleted: 1, category: 1 });
