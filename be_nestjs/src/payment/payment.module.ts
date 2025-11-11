import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { VnpayService } from './vnpay.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [PrismaModule, ConfigModule, CouponsModule],
  controllers: [PaymentController],
  providers: [PaymentService, VnpayService],
  exports: [PaymentService, VnpayService],
})
export class PaymentModule {}
