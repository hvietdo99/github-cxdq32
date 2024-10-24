import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TransactionStatus } from '../enums/transaction.enum';
import { Order } from './order.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId: Order;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);