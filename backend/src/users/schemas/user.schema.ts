import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  })
  name: string;

  @Prop({
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email',
    ],
  })
  email: string;

  @Prop({
    type: String,
    required: function (this: any) {
      return !this.firebaseUid;
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  })
  password?: string;

  @Prop({
    type: String,
    default: null,
    sparse: true,
  })
  firebaseUid?: string;

  @Prop({
    type: String,
    enum: [
      'super_admin',
      'resource_poster',
      'job_poster',
      'blog_poster',
      'tech_blog_poster',
      'digital_product_poster',
      'others',
    ],
    default: 'others',
  })
  role: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'blocked'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: String,
    default: '',
  })
  avatar: string;

  @Prop({
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  })
  bio: string;

  @Prop({
    type: String,
    default: '',
  })
  phone: string;

  @Prop({
    type: String,
    maxlength: [100, 'Location cannot exceed 100 characters'],
    default: '',
  })
  location: string;

  @Prop({
    type: String,
    default: '',
  })
  website: string;

  @Prop({
    type: String,
    default: '',
  })
  linkedin: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastLogin: Date;

  @Prop({
    type: String,
    default: '',
  })
  rejectionReason: string;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  points: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalEarnings: number;

  @Prop({
    type: [Number],
    default: [],
  })
  claimedMilestones: number[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Password hashing hook
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err: any) {
    throw err;
  }
});

// Compare password method helper
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};
