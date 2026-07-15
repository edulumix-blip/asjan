import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SyncLogDocument = SyncLog & Document;

@Schema({ timestamps: true })
export class SyncLog {
  @Prop({ required: true, index: true })
  taskName: string;

  @Prop({
    required: true,
    enum: ['running', 'completed', 'failed'],
    default: 'running',
    index: true,
  })
  status: string;

  @Prop({ required: true, default: Date.now })
  startTime: Date;

  @Prop({ type: Date, default: null })
  endTime: Date;

  @Prop({ type: Number, default: 0 })
  durationMs: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  results: any;

  @Prop({ type: String, default: 'cron' })
  triggeredBy: string;

  @Prop({ type: String, default: null })
  error: string;

  @Prop({
    type: [
      {
        source: String,
        message: String,
        externalId: String,
      },
    ],
    default: [],
  })
  syncErrors: Array<{
    source: string;
    message: string;
    externalId?: string;
  }>;
}

export const SyncLogSchema = SchemaFactory.createForClass(SyncLog);
