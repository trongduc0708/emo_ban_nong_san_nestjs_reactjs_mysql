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
    // Lấy IP address từ request headers hoặc connection
    const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.headers['x-real-ip'] || 
                   req.ip || 
                   req.connection?.remoteAddress || 
                   '127.0.0.1';
    return this.paymentService.createVnpayPayment(userId, dto, ipAddr);
  }

  // VNPay return URL
  @Get('vnpay/return')
  async vnpayReturn(@Query() query: any, @Res() res: Response) {
    try {
      const result = await this.paymentService.handleVnpayReturn(query);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      
      if (result.success) {
        // Redirect to success page với query params để frontend có thể xử lý
        const redirectUrl = new URL(`${frontendUrl}/payment/vnpay/return`);
        redirectUrl.searchParams.set('vnp_ResponseCode', query.vnp_ResponseCode || '00');
        redirectUrl.searchParams.set('vnp_TxnRef', query.vnp_TxnRef || '');
        redirectUrl.searchParams.set('vnp_Amount', query.vnp_Amount || '');
        redirectUrl.searchParams.set('vnp_TransactionNo', query.vnp_TransactionNo || '');
        redirectUrl.searchParams.set('vnp_SecureHash', query.vnp_SecureHash || '');
        res.redirect(redirectUrl.toString());
      } else {
        // Redirect to error page với query params
        const redirectUrl = new URL(`${frontendUrl}/payment/vnpay/return`);
        redirectUrl.searchParams.set('vnp_ResponseCode', query.vnp_ResponseCode || '99');
        redirectUrl.searchParams.set('vnp_TxnRef', query.vnp_TxnRef || '');
        redirectUrl.searchParams.set('vnp_Amount', query.vnp_Amount || '');
        res.redirect(redirectUrl.toString());
      }
    } catch (error) {
      console.error('VNPay return error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = new URL(`${frontendUrl}/payment/vnpay/return`);
      redirectUrl.searchParams.set('vnp_ResponseCode', '99');
      res.redirect(redirectUrl.toString());
    }
  }

  // Lấy danh sách ngân hàng hỗ trợ VNPay
  @Get('vnpay/supported-banks')
  async getSupportedBanks() {
    const banks = this.paymentService.getSupportedBanks();
    return {
      success: true,
      data: banks
    };
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
