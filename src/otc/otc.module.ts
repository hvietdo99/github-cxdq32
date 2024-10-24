import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { SmartContractService } from './services/smart-contract.service';
import { BankTransactionService } from './services/bank-transaction.service';
import { BalanceService } from './services/balance.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    SmartContractService,
    BankTransactionService,
    BalanceService,
    FraudDetectionService,
  ],
})
export class OtcModule {}