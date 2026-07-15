import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResourceDocument = Resource & Document;

@Schema({ timestamps: true })
export class Resource {
  @Prop({
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  })
  title: string;

  @Prop({
    type: String,
    enum: [
      'Software Notes',
      'Interview Notes',
      'Tools & Technology',
      'Trending Technology',
      'Video Resources',
      'Software Project',
      'Hardware Project',
    ],
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({
    type: String,
    trim: true,
    default: '',
  })
  subcategory: string;

  @Prop({ required: [true, 'Resource link is required'] })
  link: string;

  @Prop({
    type: String,
    default: '',
  })
  description: string;

  @Prop({
    type: String,
    default: '',
  })
  thumbnail: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVideo: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  likes: number;

  @Prop({
    type: Number,
    default: 0,
  })
  downloads: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  postedBy: Types.ObjectId;

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
    enum: ['devto', 'medium', 'manual'],
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
  bodyHtml: string;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Indices
ResourceSchema.index({ title: 'text', category: 'text', subcategory: 'text' });
ResourceSchema.index({ postedBy: 1, createdAt: -1 });
ResourceSchema.index({ category: 1, isDeleted: 1 });
ResourceSchema.index({ source: 1, externalId: 1 }, { sparse: true });
