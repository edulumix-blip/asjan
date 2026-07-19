import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class InterviewPrep extends Document {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true })
  tips: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  postedBy: Types.ObjectId;
}

export const InterviewPrepSchema = SchemaFactory.createForClass(InterviewPrep);

// Indexing for faster searching and categorizing
InterviewPrepSchema.index({ category: 1 });
InterviewPrepSchema.index({ question: 'text', answer: 'text' });
