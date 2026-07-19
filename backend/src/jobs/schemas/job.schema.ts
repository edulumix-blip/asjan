import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: [true, 'Job title is required'], trim: true })
  title: string;

  @Prop({ required: [true, 'Company name is required'], trim: true })
  company: string;

  @Prop({ required: [true, 'Location is required'], trim: true })
  location: string;

  @Prop({
    type: String,
    enum: [
      'IT Job',
      'Non IT Job',
      'Walk In Drive',
      'Govt Job',
      'Internship',
      'Part Time Job',
      'Remote Job',
      'Others',
    ],
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({
    type: String,
    enum: ['Fresher', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years'],
    default: 'Fresher',
  })
  experience: string;

  @Prop({ type: String, default: 'Not Disclosed' })
  salary: string;

  @Prop({
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  })
  status: string;

  @Prop({ type: String, default: '', trim: true })
  companyLogo: string;

  @Prop({ required: [true, 'Apply link or email is required'], trim: true })
  applyLink: string;

  @Prop({
    type: String,
    enum: ['link', 'email'],
    default: 'link',
  })
  applyType: string;

  @Prop({ required: [true, 'Job description is required'] })
  description: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({
    type: String,
    enum: ['adzuna', 'jsearch', 'manual'],
    default: 'manual',
  })
  source: string;

  @Prop({ type: String, default: null, sparse: true })
  externalId: string;

  @Prop({ type: Date, default: null })
  closedSyncedAt: Date;

  @Prop({ type: Date, default: null })
  lastSeenAt: Date;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Generate slug before saving
JobSchema.pre('save', function (this: any) {
  if (this.isNew || this.isModified('title') || this.isModified('company')) {
    const titleSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const companySlug = this.company
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.slug = `${titleSlug}-${companySlug}-${this._id || Date.now()}`;
  }
});

// Auto-detect if applyLink is email or URL
JobSchema.pre('save', function (this: any) {
  if (this.isModified('applyLink')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(this.applyLink)) {
      this.applyType = 'email';
    } else {
      this.applyType = 'link';
    }
  }
});

// Indices
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ postedBy: 1, createdAt: -1 });
JobSchema.index({ category: 1, status: 1, isDeleted: 1 });
JobSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
JobSchema.index({ source: 1, externalId: 1 }, { sparse: true });
JobSchema.index({ source: 1, status: 1, lastSeenAt: 1, isDeleted: 1 });
JobSchema.index({ status: 1, isDeleted: 1, category: 1, city: 1, location: 1, experience: 1 });
