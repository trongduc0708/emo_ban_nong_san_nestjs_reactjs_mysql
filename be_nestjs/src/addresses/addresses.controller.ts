import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly service: AddressesService) {}

  // Lấy danh sách địa chỉ của user (tạm: từ header x-user-id)
  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any) {
    const userId = Number(req.user?.userId);
    return this.service.list(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: any) {
    const userId = Number(req.user?.userId);
    return this.service.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    const userId = Number(req.user?.userId);
    return this.service.update(userId, Number(id), dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = Number(req.user?.userId);
    return this.service.remove(userId, Number(id));
  }
}


