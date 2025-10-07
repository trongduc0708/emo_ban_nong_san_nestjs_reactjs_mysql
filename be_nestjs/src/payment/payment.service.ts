import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async processPayment(userId: number, dto: ProcessPaymentDto) {
    const { cartId, paymentMethod = 'COD', notes } = dto;

    // Lấy giỏ hàng và kiểm tra quyền sở hữu
    const cart = await this.prisma.cart.findFirst({
      where: { 
        id: cartId, 
        userId: BigInt(userId) 
      },
      include: {
        items: {
          include: {
            product: {
              include: { variants: true }
            },
            variant: true
          }
        }
      }
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    if (cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    // Kiểm tra số lượng tồn kho trước khi thanh toán
    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;
      
      // Kiểm tra tồn kho của variant nếu có
      if (variant && variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Biến thể "${variant.variantName}" của sản phẩm "${product.name}" chỉ còn ${variant.stockQuantity} sản phẩm trong kho`
        );
      }
    }

    // Bắt đầu transaction để đảm bảo tính nhất quán
    return await this.prisma.$transaction(async (tx) => {
      // Tạo đơn hàng
      const totalAmount = cart.items.reduce((sum, item) => 
        sum + Number(item.unitPriceSnapshot) * item.quantity, 0
      );
      
      const order = await tx.order.create({
        data: {
          orderCode: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: BigInt(userId),
          status: 'PENDING',
          paymentMethod: paymentMethod,
          notes,
          totalAmount: totalAmount
        }
      });

      // Tạo order items và TRỪ SỐ LƯỢNG KHO
      for (const item of cart.items) {
        const product = item.product;
        const variant = item.variant;
        const unitPrice = Number(item.unitPriceSnapshot);
        const totalPrice = unitPrice * item.quantity;
        
        // Tạo order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: product.name,
            variantName: variant?.variantName || null,
            sku: product.sku,
            quantity: item.quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
          }
        });

        // TRỪ SỐ LƯỢNG KHO CỦA VARIANT NẾU CÓ
        if (item.variantId && variant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // XÓA TOÀN BỘ GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return {
        success: true,
        message: 'Thanh toán thành công',
        data: {
          orderId: Number(order.id),
          totalAmount: order.totalAmount,
          status: order.status
        }
      };
    });
  }

  async getOrderHistory(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId: BigInt(userId) },
      include: {
        items: {
          include: {
            product: {
              include: { images: { orderBy: { position: 'asc' }, take: 1 } }
            },
            variant: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: { orders } };
  }
}
