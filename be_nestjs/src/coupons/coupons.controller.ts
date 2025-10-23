import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * Lấy danh sách coupons với phân trang và lọc
   * Query params: page, limit, search, status, type
   */
  @Get()
  async getCoupons(@Query() params: any) {
    return this.couponsService.getCoupons(params);
  }

  /**
   * Lấy thông tin chi tiết một coupon
   */
  @Get(':id')
  async getCoupon(@Param('id') id: string) {
    return this.couponsService.getCoupon(parseInt(id));
  }

  /**
   * Tạo coupon mới
   */
  @Post()
  async createCoupon(@Body() data: any) {
    return this.couponsService.createCoupon(data);
  }

  /**
   * Cập nhật coupon
   */
  @Put(':id')
  async updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.couponsService.updateCoupon(parseInt(id), data);
  }

  /**
   * Xóa coupon
   */
  @Delete(':id')
  async deleteCoupon(@Param('id') id: string) {
    return this.couponsService.deleteCoupon(parseInt(id));
  }

  /**
   * Kiểm tra tính hợp lệ của coupon
   */
  @Post('validate')
  async validateCoupon(@Body() data: { code: string; userId: number; orderAmount: number }) {
    return this.couponsService.validateCoupon(data.code, data.userId, data.orderAmount);
  }
}
