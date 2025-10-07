import { Controller, Get, Post, Put, Delete, Req, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Lấy giỏ hàng của user hiện tại
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@Req() req: any) {
    const userId = Number(req.user?.userId);
    return this.cartService.getCart(userId);
  }

  // Thêm sản phẩm vào giỏ hàng
  @UseGuards(JwtAuthGuard)
  @Post('items')
  async addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
    const userId = Number(req.user?.userId);
    return this.cartService.addToCart(userId, dto);
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  @UseGuards(JwtAuthGuard)
  @Put('items/:id')
  async updateCartItem(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    const userId = Number(req.user?.userId);
    return this.cartService.updateCartItem(userId, Number(id), dto);
  }

  // Xóa sản phẩm khỏi giỏ hàng
  @UseGuards(JwtAuthGuard)
  @Delete('items/:id')
  async removeFromCart(@Req() req: any, @Param('id') id: string) {
    const userId = Number(req.user?.userId);
    return this.cartService.removeFromCart(userId, Number(id));
  }

  // Xóa toàn bộ giỏ hàng
  @UseGuards(JwtAuthGuard)
  @Delete()
  async clearCart(@Req() req: any) {
    const userId = Number(req.user?.userId);
    return this.cartService.clearCart(userId);
  }
}
