import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Lấy danh sách đơn hàng với phân trang, tìm kiếm và lọc
   * @param query - Query parameters: page, limit, search, status, paymentStatus
   * @returns Danh sách đơn hàng với thông tin phân trang
   */
  @Get()
  async getOrders(@Query() query: any) {
    return await this.ordersService.getOrders(query);
  }

  /**
   * Lấy thông tin chi tiết một đơn hàng
   * @param id - ID của đơn hàng
   * @returns Thông tin đơn hàng
   */
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return await this.ordersService.getOrder(parseInt(id));
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param id - ID của đơn hàng
   * @param body - Dữ liệu cập nhật: { status }
   * @returns Đơn hàng đã cập nhật
   */
  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return await this.ordersService.updateOrderStatus(parseInt(id), body.status);
  }

  /**
   * Cập nhật trạng thái thanh toán đơn hàng
   * @param id - ID của đơn hàng
   * @param body - Dữ liệu cập nhật: { paymentStatus }
   * @returns Đơn hàng đã cập nhật
   */
  @Put(':id/payment-status')
  async updateOrderPaymentStatus(@Param('id') id: string, @Body() body: { paymentStatus: string }) {
    return await this.ordersService.updateOrderPaymentStatus(parseInt(id), body.paymentStatus);
  }

  /**
   * Lấy thống kê đơn hàng
   * @returns Thống kê đơn hàng
   */
  @Get('stats/overview')
  async getOrderStats() {
    return await this.ordersService.getOrderStats();
  }
}
