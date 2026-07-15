import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema()
export class Lesson {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  videoUrl: string;

  @Prop({ type: Number, default: 0 })
  duration: number;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: false })
  isFree: boolean;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ _id: false })
class Instructor {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  avatar: string;
}
const InstructorSchema = SchemaFactory.createForClass(Instructor);

@Schema({ _id: false })
class Rating {
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  average: number;

  @Prop({ type: Number, default: 0 })
  count: number;
}
const RatingSchema = SchemaFactory.createForClass(Rating);

export type CourseDocument = Course & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Course {
  @Prop({
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  })
  title: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters'],
  })
  description: string;

  @Prop({
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters'],
  })
  shortDescription: string;

  @Prop({ type: String, default: '' })
  thumbnail: string;

  @Prop({ type: String, default: '' })
  previewVideo: string;

  @Prop({
    type: String,
    enum: [
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
    ],
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  })
  level: string;

  @Prop({
    type: String,
    enum: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Others'],
    default: 'English',
  })
  language: string;

  @Prop({
    type: Number,
    required: [true, 'Actual price is required'],
    min: [0, 'Price cannot be negative'],
  })
  actualPrice: number;

  @Prop({
    type: Number,
    required: [true, 'Offer price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function (this: any, v: number) {
        return v <= this.actualPrice;
      },
      message: 'Offer price cannot be greater than actual price',
    },
  })
  offerPrice: number;

  @Prop({ type: Boolean, default: false })
  isFree: boolean;

  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];

  @Prop({ type: Number, default: 0 })
  totalDuration: number;

  @Prop({ type: Number, default: 0 })
  totalLessons: number;

  @Prop({ type: InstructorSchema, required: true })
  instructor: Instructor;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({ type: [String], default: [] })
  whatYouWillLearn: string[];

  @Prop({ type: [String], default: [], trim: true })
  tags: string[];

  @Prop({ type: String, default: '' })
  enrollmentLink: string;

  @Prop({ type: String, default: '918272946202' })
  whatsappNumber: string;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Number, default: 0 })
  enrollments: number;

  @Prop({ type: RatingSchema, default: () => ({ average: 0, count: 0 }) })
  rating: Rating;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['udemy', 'manual'],
    default: 'manual',
  })
  source: string;

  @Prop({ type: String, default: '' })
  externalId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  rawApiData: any;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ source: 1, externalId: 1 }, { sparse: true });
CourseSchema.index({ isPublished: 1, createdAt: -1 });
CourseSchema.index({ postedBy: 1, createdAt: -1 });

// Generate slug before saving
CourseSchema.pre('save', function (this: any) {
  if (this.isModified('title')) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100) +
      '-' +
      Date.now().toString(36);
  }

  if (this.lessons && this.lessons.length > 0) {
    this.totalLessons = this.lessons.length;
    this.totalDuration = this.lessons.reduce(
      (acc, lesson: any) => acc + (lesson.duration || 0),
      0,
    );
  }
});

// Virtual for discount percentage
CourseSchema.virtual('discountPercentage').get(function (this: any) {
  if (
    this.actualPrice &&
    this.offerPrice &&
    this.actualPrice > this.offerPrice
  ) {
    return Math.round(
      ((this.actualPrice - this.offerPrice) / this.actualPrice) * 100,
    );
  }
  return 0;
});
