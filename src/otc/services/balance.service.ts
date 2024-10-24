import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { SmartContractService } from './smart-contract.service';
import { BankTransactionService } from './bank-transaction.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private smartContractService: SmartContractService,
    private bankTransactionService: BankTransactionService,
  ) {}

  async checkUsdtBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user?.walletAddress) {
        return false;
      }

      const balance = await this.smartContractService.getWalletBalance(user.walletAddress);
      return balance >= amount;
    } catch (error) {
      this.logger.error(`Failed to check USDT balance: ${error.message}`);
      return false;
    }
  }

  async checkFiatBalance(amount: number): Promise<boolean> {
    try {
      const systemBalance = await this.bankTransactionService.getSystemBalance();
      return systemBalance >= amount;
    } catch (error) {
      this.logger.error(`Failed to check fiat balance: ${error.message}`);
      return false;
    }
  }
}