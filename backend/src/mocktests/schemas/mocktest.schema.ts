import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  options: string[];

  @Prop({ type: Number, required: true })
  correctAnswer: number; // Index of correct option (0-based)

  @Prop({ type: String, default: '' })
  explanation: string;

  @Prop({
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  })
  difficulty: string;

  @Prop({ type: Number, default: 1 })
  marks: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);

export type MockTestDocument = MockTest & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class MockTest {
  @Prop({
    required: [true, 'Test title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters'],
  })
  title: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({
    type: String,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  })
  description: string;

  @Prop({ type: String, default: '' })
  thumbnail: string;

  @Prop({
    type: String,
    enum: [
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
    ],
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({ type: String, default: '', trim: true })
  company: string;

  @Prop({
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Medium',
  })
  difficulty: string;

  @Prop({
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
  })
  duration: number;

  @Prop({ type: Number, default: 0 })
  totalQuestions: number;

  @Prop({ type: Number, default: 0 })
  totalMarks: number;

  @Prop({ type: Number, default: 0 })
  passingMarks: number;

  @Prop({ type: [QuestionSchema], default: [] })
  questions: Question[];

  @Prop({ type: [String], default: [] })
  instructions: string[];

  @Prop({ type: [String], default: [], trim: true })
  tags: string[];

  @Prop({ type: Boolean, default: true })
  isFree: boolean;

  @Prop({ type: Number, default: 0 })
  price: number;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: Number, default: 0 })
  avgScore: number;

  @Prop({ type: String, default: '918272946202' })
  whatsappNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({ type: String, default: '' })
  externalId: string;
}

export const MockTestSchema = SchemaFactory.createForClass(MockTest);

MockTestSchema.index({ externalId: 1 }, { sparse: true });
MockTestSchema.index({ isPublished: 1, createdAt: -1 });
MockTestSchema.index({ isPublished: 1, category: 1, createdAt: -1 });
MockTestSchema.index({ postedBy: 1, createdAt: -1 });

// Generate slug before saving
MockTestSchema.pre('save', function (this: any) {
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

  // Calculate totals from questions
  if (this.questions && this.questions.length > 0) {
    this.totalQuestions = this.questions.length;
    this.totalMarks = this.questions.reduce(
      (acc, q: any) => acc + (q.marks || 1),
      0,
    );
    if (!this.passingMarks) {
      this.passingMarks = Math.ceil(this.totalMarks * 0.4); // 40% passing by default
    }
  }
});
