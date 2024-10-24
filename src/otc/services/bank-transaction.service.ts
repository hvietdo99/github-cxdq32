import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BankTransactionService {
  private readonly logger = new Logger(BankTransactionService.name);

  constructor(private configService: ConfigService) {}

  async checkBankTransaction(transactionId: string): Promise<boolean> {
    try {
      const bankApiUrl = this.configService.get('BANK_API_URL');
      const response = await axios.get(`${bankApiUrl}/transactions/${transactionId}`);
      
      return response.data.status === 'COMPLETED';
    } catch (error) {
      this.logger.error(`Failed to check bank transaction: ${error.message}`);
      throw error;
    }
  }

  async processFiatPayment(userId: string, amount: number, bankDetails: any): Promise<boolean> {
    try {
      const bankApiUrl = this.configService.get('BANK_API_URL');
      await axios.post(`${bankApiUrl}/transfers`, {
        userId,
        amount,
        bankDetails,
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to process fiat payment: ${error.message}`);
      throw error;
    }
  }

  async getSystemBalance(): Promise<number> {
    try {
      const bankApiUrl = this.configService.get('BANK_API_URL');
      const response = await axios.get(`${bankApiUrl}/balance`);
      return response.data.balance;
    } catch (error) {
      this.logger.error(`Failed to get system balance: ${error.message}`);
      throw error;
    }
  }
}