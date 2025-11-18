import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Lấy thống kê tổng quan cho dashboard admin
   * Cho phép admin và seller
   */
  @Get('dashboard')
  @Roles('admin', 'seller')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * Lấy danh sách sản phẩm với phân trang và lọc
   * Query params: page, limit, search, category, status
   * Chỉ dành cho admin
   */
  @Get('products')
  @Roles('admin')
  async getProducts(@Query() params: any) {
    return this.adminService.getProducts(params);
  }

  /**
   * Lấy thông tin chi tiết một sản phẩm
   * Chỉ dành cho admin
   */
  @Get('products/:id')
  @Roles('admin')
  async getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(parseInt(id));
  }

  /**
   * Tạo sản phẩm mới
   * Chỉ dành cho admin
   */
  @Post('products')
  @Roles('admin')
  async createProduct(@Body() data: any) {
    return this.adminService.createProduct(data);
  }

  /**
   * Cập nhật sản phẩm
   * Chỉ dành cho admin
   */
  @Put('products/:id')
  @Roles('admin')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProduct(parseInt(id), data);
  }

  /**
   * Xóa sản phẩm
   * Chỉ dành cho admin
   */
  @Delete('products/:id')
  @Roles('admin')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(parseInt(id));
  }

  // Orders Management
  /**
   * Lấy danh sách đơn hàng
   * Cho phép admin và seller
   */
  @Get('orders')
  @Roles('admin', 'seller')
  async getOrders(@Query() params: any) {
    return this.adminService.getOrders(params);
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * Cho phép admin và seller
   */
  @Put('orders/:id/status')
  @Roles('admin', 'seller')
  async updateOrderStatus(@Param('id') id: string, @Body() data: { status: string }) {
    return this.adminService.updateOrderStatus(parseInt(id), data.status);
  }

  // Users Management
  /**
   * Lấy danh sách users với phân trang và lọc
   * Query params: page, limit, search, role
   * Chỉ dành cho admin
   */
  @Get('users')
  @Roles('admin')
  async getUsers(@Query() params: any) {
    return this.adminService.getUsers(params);
  }

  /**
   * Lấy thông tin chi tiết một user
   * Chỉ dành cho admin
   */
  @Get('users/:id')
  @Roles('admin')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(parseInt(id));
  }

  /**
   * Cập nhật thông tin user (bao gồm role)
   * Chỉ dành cho admin
   */
  @Put('users/:id')
  @Roles('admin')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(parseInt(id), data);
  }

  /**
   * Cập nhật role của user
   * Chỉ dành cho admin
   */
  @Put('users/:id/role')
  @Roles('admin')
  async updateUserRole(@Param('id') id: string, @Body() data: { role: 'customer' | 'admin' | 'seller' }) {
    return this.adminService.updateUser(parseInt(id), { role: data.role });
  }

  /**
   * Lấy danh sách tất cả danh mục
   * Chỉ dành cho admin
   */
  @Get('categories')
  @Roles('admin')
  async getCategories() {
    return this.adminService.getCategories();
  }

  /**
   * Lấy thông tin chi tiết một danh mục
   * Chỉ dành cho admin
   */
  @Get('categories/:id')
  @Roles('admin')
  async getCategory(@Param('id') id: string) {
    return this.adminService.getCategory(parseInt(id));
  }

  /**
   * Tạo danh mục mới
   * Chỉ dành cho admin
   */
  @Post('categories')
  @Roles('admin')
  async createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  /**
   * Cập nhật danh mục
   * Chỉ dành cho admin
   */
  @Put('categories/:id')
  @Roles('admin')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(parseInt(id), data);
  }

  /**
   * Xóa danh mục
   * Chỉ dành cho admin
   */
  @Delete('categories/:id')
  @Roles('admin')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(parseInt(id));
  }

  // Reviews Management
  /**
   * Lấy danh sách reviews với phân trang và lọc
   * Query params: page, limit, search, productId, userId, isApproved, rating
   * Chỉ dành cho admin
   */
  @Get('reviews')
  @Roles('admin')
  async getReviews(@Query() params: any) {
    return this.adminService.getReviews(params);
  }

  /**
   * Lấy thông tin chi tiết một review
   * Chỉ dành cho admin
   */
  @Get('reviews/:id')
  @Roles('admin')
  async getReview(@Param('id') id: string) {
    return this.adminService.getReview(parseInt(id));
  }

  /**
   * Phê duyệt review
   * Chỉ dành cho admin
   */
  @Put('reviews/:id/approve')
  @Roles('admin')
  async approveReview(@Param('id') id: string) {
    return this.adminService.approveReview(parseInt(id));
  }

  /**
   * Từ chối/hủy phê duyệt review
   * Chỉ dành cho admin
   */
  @Put('reviews/:id/reject')
  @Roles('admin')
  async rejectReview(@Param('id') id: string) {
    return this.adminService.rejectReview(parseInt(id));
  }

  /**
   * Xóa review
   * Chỉ dành cho admin
   */
  @Delete('reviews/:id')
  @Roles('admin')
  async deleteReview(@Param('id') id: string) {
    return this.adminService.deleteReview(parseInt(id));
  }

  // Settings Management
  /**
   * Lấy tất cả settings
   * Chỉ dành cho admin
   */
  @Get('settings')
  @Roles('admin')
  async getSettings() {
    return this.adminService.getSettings();
  }

  /**
   * Cập nhật setting
   * Chỉ dành cho admin
   */
  @Put('settings/:key')
  @Roles('admin')
  async updateSetting(@Param('key') key: string, @Body() data: { value: string }) {
    return this.adminService.updateSetting(key, data.value);
  }

  // Reports Management
  /**
   * Lấy báo cáo chi tiết
   * Query params: startDate, endDate, period (day/week/month)
   * Chỉ dành cho admin
   */
  @Get('reports')
  @Roles('admin')
  async getReports(@Query() params: any) {
    return this.adminService.getReports(params);
  }

  /**
   * Lấy báo cáo tồn kho
   * Query params: lowStockThreshold (mặc định 50)
   * Chỉ dành cho admin
   */
  @Get('reports/inventory')
  @Roles('admin')
  async getInventoryReport(@Query() params: any) {
    return this.adminService.getInventoryReport(params);
  }
}
