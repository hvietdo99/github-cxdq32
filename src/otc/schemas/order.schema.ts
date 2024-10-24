import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { OrderStatus, OrderType } from '../enums/order.enum';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, enum: OrderType })
  type: OrderType;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
}

export const OrderSchema = SchemaFactory.createForClass(Order);