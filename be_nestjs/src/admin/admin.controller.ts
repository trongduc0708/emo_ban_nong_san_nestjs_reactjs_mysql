import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Lấy thống kê tổng quan cho dashboard admin
   */
  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Lấy danh sách sản phẩm với phân trang và lọc
   * Query params: page, limit, search, category, status
   */
  @Get('products')
  async getProducts(@Query() params: any) {
    return this.adminService.getProducts(params);
  }

  /**
   * Lấy thông tin chi tiết một sản phẩm
   */
  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(parseInt(id));
  }

  /**
   * Tạo sản phẩm mới
   */
  @Post('products')
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  /**
   * Cập nhật sản phẩm
   */
  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(parseInt(id), data);
  }

  /**
   * Xóa sản phẩm
   */
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(parseInt(id));
  }

  // Orders Management
  @Get('orders')
  async getOrders(@Query() params: any) {
    return this.adminService.getOrders(params);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.adminService.updateOrderStatus(parseInt(id), data.status);
  }

  // Users Management
  /**
   * Lấy danh sách users với phân trang và lọc
   * Query params: page, limit, search, role
   */
  @Get('users')
  async getUsers(@Query() params: any) {
    return this.adminService.getUsers(params);
  }

  /**
   * Lấy thông tin chi tiết một user
   */
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(parseInt(id));
  }

  /**
   * Cập nhật thông tin user (bao gồm role)
   */
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(parseInt(id), data);
  }

  /**
   * Cập nhật role của user
   */
  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() data: { role: 'customer' | 'admin' }) {
    return this.adminService.updateUser(parseInt(id), { role: data.role });
  }

  /**
   * Lấy danh sách tất cả danh mục
   */
  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  /**
   * Lấy thông tin chi tiết một danh mục
   */
  @Get('categories/:id')
  async getCategory(@Param('id') id: string) {
    return this.adminService.getCategory(parseInt(id));
  }

  /**
   * Tạo danh mục mới
   */
  @Post('categories')
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  /**
   * Cập nhật danh mục
   */
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(parseInt(id), data);
  }

  /**
   * Xóa danh mục
   */
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(parseInt(id));
  }

  // Reviews Management
  /**
   * Lấy danh sách reviews với phân trang và lọc
   * Query params: page, limit, search, productId, userId, isApproved, rating
   */
  @Get('reviews')
  async getReviews(@Query() params: any) {
    return this.adminService.getReviews(params);
  }

  /**
   * Lấy thông tin chi tiết một review
   */
  @Get('reviews/:id')
  async getReview(@Param('id') id: string) {
    return this.adminService.getReview(parseInt(id));
  }

  /**
   * Phê duyệt review
   */
  @Put('reviews/:id/approve')
  async approveReview(@Param('id') id: string) {
    return this.adminService.approveReview(parseInt(id));
  }

  /**
   * Từ chối/hủy phê duyệt review
   */
  @Put('reviews/:id/reject')
  async rejectReview(@Param('id') id: string) {
    return this.adminService.rejectReview(parseInt(id));
  }

  /**
   * Xóa review
   */
  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(parseInt(id));
  }

  // Settings Management
  /**
   * Lấy tất cả settings
   */
  @Get('settings')
  async getSettings() {
    return this.adminService.getSettings();
  }

  /**
   * Cập nhật setting
   */
  @Put('settings/:key')
  async updateSetting(@Param('key') key: string, @Body() data: { value: string }) {
    return this.adminService.updateSetting(key, data.value);
  }

  // Reports Management
  /**
   * Lấy báo cáo chi tiết
   * Query params: startDate, endDate, period (day/week/month)
   */
  @Get('reports')
  async getReports(@Query() params: any) {
    return this.adminService.getReports(params);
  }

  /**
   * Lấy báo cáo tồn kho
   * Query params: lowStockThreshold (mặc định 50)
   */
  @Get('reports/inventory')
  async getInventoryReport(@Query() params: any) {
    return this.adminService.getInventoryReport(params);
  }
}
