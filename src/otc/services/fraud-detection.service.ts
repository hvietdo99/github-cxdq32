import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { User } from '../../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);
  private readonly thirdPartyApiUrl: string;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    this.thirdPartyApiUrl = this.configService.get<string>('FRAUD_DETECTION_API_URL');
  }

  async detectAbnormalTrading(userId: string, amount: number): Promise<boolean> {
    try {
      // Check user's trading history
      const recentOrders = await this.orderModel
        .find({ userId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
        .exec();

      // Calculate total trading volume in last 24 hours
      const totalVolume = recentOrders.reduce((sum, order) => sum + order.amount, 0);

      // Check if current order would exceed daily limit
      const dailyLimit = this.configService.get<number>('DAILY_TRADING_LIMIT');
      if (totalVolume + amount > dailyLimit) {
        this.logger.warn(`Abnormal trading detected for user ${userId}: Daily limit exceeded`);
        return true;
      }

      // Check for rapid successive orders
      const orderFrequency = this.checkOrderFrequency(recentOrders);
      if (orderFrequency) {
        this.logger.warn(`Abnormal trading detected for user ${userId}: High frequency trading`);
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(`Error in fraud detection: ${error.message}`);
      return true; // Fail safe: treat as suspicious if error occurs
    }
  }

  private checkOrderFrequency(orders: Order[]): boolean {
    if (orders.length < 2) return false;

    // Check time difference between consecutive orders
    for (let i = 1; i < orders.length; i++) {
      const timeDiff = orders[i].createdAt.getTime() - orders[i-1].createdAt.getTime();
      const minOrderInterval = this.configService.get<number>('MIN_ORDER_INTERVAL_MS', 60000); // 1 minute default
      
      if (timeDiff < minOrderInterval) {
        return true;
      }
    }
    return false;
  }

  async checkThirdPartyFraudDetection(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      
      const response = await axios.post(`${this.thirdPartyApiUrl}/check`, {
        userId: userId,
        userEmail: user.email,
        amount: amount,
        timestamp: new Date().toISOString()
      });

      return response.data.isSuspicious;
    } catch (error) {
      this.logger.error(`Third-party fraud detection failed: ${error.message}`);
      return true; // Fail safe: treat as suspicious if service is unavailable
    }
  }
}