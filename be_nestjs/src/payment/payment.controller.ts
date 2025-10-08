import { Controller, Post, Get, Body, Req, UseGuards, Query, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Xử lý thanh toán - TRỪ SỐ LƯỢNG KHO
  @UseGuards(JwtAuthGuard)
  @Post('process')
  async processPayment(@Req() req: any, @Body() dto: ProcessPaymentDto) {
    const userId = Number(req.user?.id);
    return this.paymentService.processPayment(userId, dto);
  }

  // Lấy lịch sử đơn hàng
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async getOrderHistory(@Req() req: any) {
    const userId = Number(req.user?.id);
    return this.paymentService.getOrderHistory(userId);
  }

  // Tạo VNPay payment URL
  @UseGuards(JwtAuthGuard)
  @Post('vnpay/create')
  async createVnpayPayment(@Req() req: any, @Body() dto: ProcessPaymentDto) {
    const userId = Number(req.user?.id);
    const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
    return this.paymentService.createVnpayPayment(userId, dto, ipAddr);
  }

  // VNPay return URL
  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    try {
      const result = await this.paymentService.handleVnpayReturn(query);
      
      if (result.success) {
        // Redirect to success page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        res.redirect(`${frontendUrl}/order-success/${result.data.orderId}`);
      } else {
        // Redirect to error page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        res.redirect(`${frontendUrl}/order-failed`);
      }
    } catch (error) {
      console.error('VNPay return error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/order-failed`);
    }
  }

  // VNPay IPN (Instant Payment Notification)
  @Post('vnpay/ipn')
  async vnpayIpn(@Body() body: any) {
    try {
      const result = await this.paymentService.handleVnpayReturn(body);
      return { RspCode: '00', Message: 'Success' };
    } catch (error) {
      console.error('VNPay IPN error:', error);
      return { RspCode: '99', Message: 'Error' };
    }
  }
}
