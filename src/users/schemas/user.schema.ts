import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop()
  twoFactorSecret?: string;

  @Prop({ default: false })
  isTwoFactorEnabled: boolean;

  @Prop()
  walletAddress?: string;

  @Prop({ required: true, enum: KYCStatus, default: KYCStatus.PENDING })
  kycStatus: KYCStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);