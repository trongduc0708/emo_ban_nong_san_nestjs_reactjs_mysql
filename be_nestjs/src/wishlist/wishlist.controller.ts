import { Controller, Get, Post, Delete, Param, Req, UseGuards, BadRequestException, Body } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getWishlist(@Req() req: any) {
    const userId = Number(req.user?.id);
    
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    return this.wishlistService.getWishlist(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async addToWishlist(@Req() req: any, @Body() body: { productId: number }) {
    const userId = Number(req.user?.id);
    const productIdNum = Number(body.productId);
    
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    if (isNaN(productIdNum)) {
      throw new BadRequestException('Invalid product ID');
    }
    
    return this.wishlistService.addToWishlist(userId, productIdNum);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':productId')
  async removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    const userId = Number(req.user?.id);
    const productIdNum = Number(productId);
    
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    
    if (isNaN(productIdNum)) {
      throw new BadRequestException('Invalid product ID');
    }
    
    return this.wishlistService.removeFromWishlist(userId, productIdNum);
  }
}
