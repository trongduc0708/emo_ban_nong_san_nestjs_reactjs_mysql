import { Controller, Get, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cart')
export class CartController {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy giỏ hàng theo userId từ header Authorization (tạm thời: x-user-id)
  @Get()
  async getCart(@Req() req: any) {
    const userIdHeader = req.headers['x-user-id'];
    const userId = userIdHeader ? Number(userIdHeader) : null;

    if (!userId || Number.isNaN(userId)) {
      return { success: true, data: { items: [] } };
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId: BigInt(userId) },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { position: 'asc' }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    return { success: true, data: { items: cart?.items ?? [] } };
  }
}
