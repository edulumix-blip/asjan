import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DigitalProductDocument = DigitalProduct & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class DigitalProduct {
  @Prop({
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  })
  name: string;

  @Prop({
    type: String,
    enum: [
      'AI Tools',
      'Design & Creative',
      'Entertainment & Streaming',
      'Productivity & Office',
      'Security & Utility',
      'Education & Learning',
      'Others',
    ],
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({ type: String, trim: true, default: '' })
  subcategory: string;

  @Prop({
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  })
  description: string;

  @Prop({ type: String, default: '' })
  thumbnail: string;

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

  @Prop({ type: String, default: '918272946202' })
  whatsappNumber: string;

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: Number, default: 0 })
  views: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;

  @Prop({ type: String, default: '' })
  externalId: string;
}

export const DigitalProductSchema =
  SchemaFactory.createForClass(DigitalProduct);

DigitalProductSchema.index({ externalId: 1 }, { sparse: true });
DigitalProductSchema.index({ isAvailable: 1, createdAt: -1 });
DigitalProductSchema.index({ postedBy: 1, createdAt: -1 });

// Virtual for discount percentage
DigitalProductSchema.virtual('discountPercentage').get(function (this: any) {
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
