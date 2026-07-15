import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClaimDocument = Claim & Document;

@Schema({ timestamps: true })
export class Claim {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
    enum: [10, 25, 50, 100],
  })
  points: number;

  @Prop({
    type: Number,
    required: true,
    enum: [15, 30, 60, 120],
  })
  amount: number;

  @Prop({
    type: String,
    enum: ['upi', 'phone'],
    required: true,
  })
  paymentMethod: string;

  @Prop({ required: true, trim: true })
  paymentDetails: string;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'paid', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: String, default: '' })
  transactionId: string;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  processedBy: Types.ObjectId;

  @Prop({ type: Date, default: null })
  processedAt: Date;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
