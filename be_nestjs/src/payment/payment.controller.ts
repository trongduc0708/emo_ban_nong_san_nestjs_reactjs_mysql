import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Xử lý thanh toán - TRỪ SỐ LƯỢNG KHO
  @UseGuards(JwtAuthGuard)
  @Post('process')
  async processPayment(@Req() req: any, @Body() dto: ProcessPaymentDto) {
    const userId = Number(req.user?.userId);
    return this.paymentService.processPayment(userId, dto);
  }

  // Lấy lịch sử đơn hàng
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrderHistory(@Req() req: any) {
    const userId = Number(req.user?.userId);
    return this.paymentService.getOrderHistory(userId);
  }
}
