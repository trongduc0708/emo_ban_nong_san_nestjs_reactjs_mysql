import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  /**
   * Lấy danh sách địa chỉ giao hàng của người dùng hiện tại
   * - Xác thực JWT (JwtAuthGuard) và lấy userId từ token
   * - Trả về danh sách theo thứ tự: mặc định trước, sau đó theo id mới nhất
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any) {
    const userId = Number(req.user?.userId);
    return this.service.list(userId);
  }

  /**
   * Thêm địa chỉ giao hàng mới cho người dùng hiện tại
   * - Nếu isDefault = true: bỏ cờ mặc định ở các địa chỉ khác của user
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    const userId = Number(req.user?.userId);
    return this.service.create(userId, dto);
  }

  /**
   * Cập nhật địa chỉ theo id (chỉ cho địa chỉ thuộc về user hiện tại)
   * - Cho phép cập nhật từng phần (partial update)
   * - Hỗ trợ đặt lại địa chỉ mặc định
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    const userId = Number(req.user?.userId);
    return this.service.update(userId, Number(id), dto);
  }

  /**
   * Xóa địa chỉ theo id (chỉ cho địa chỉ thuộc về user hiện tại)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = Number(req.user?.userId);
    return this.service.remove(userId, Number(id));
  }
}


