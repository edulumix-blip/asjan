import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema()
export class Otp {
  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  otp: string | null;

  @Prop({
    type: Boolean,
    default: false,
  })
  verified: boolean;

  @Prop({
    type: Date,
    default: Date.now,
    expires: 300, // Document automatically expires in 5 minutes (300 seconds)
  })
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
