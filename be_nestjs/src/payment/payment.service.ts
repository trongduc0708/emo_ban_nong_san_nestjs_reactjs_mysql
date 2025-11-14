import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { VnpayService } from './vnpay.service';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vnpayService: VnpayService,
    private readonly couponsService: CouponsService
  ) {}

  async processPayment(userId: number, dto: ProcessPaymentDto) {
    const { cartId, paymentMethod = 'COD', notes, couponCode } = dto;

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

    // Tính toán tổng tiền và xử lý coupon
    const subtotalAmount = cart.items.reduce((sum, item) => 
      sum + Number(item.unitPriceSnapshot) * item.quantity, 0
    );
    
    let discountAmount = 0;
    let couponId: bigint | null = null;
    
    if (couponCode) {
      try {
        const couponValidation = await this.couponsService.validateCoupon(
          couponCode,
          userId,
          subtotalAmount
        );
        discountAmount = couponValidation.discountAmount;
        couponId = BigInt(couponValidation.coupon.id);
      } catch (error: any) {
        throw new BadRequestException(error.message || 'Mã khuyến mãi không hợp lệ');
      }
    }

    const shippingFee = 20000; // Phí vận chuyển cố định
    const totalAmount = subtotalAmount - discountAmount + shippingFee;

    // Bắt đầu transaction để đảm bảo tính nhất quán
    return await this.prisma.$transaction(async (tx) => {
      // Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: BigInt(userId),
          ...(couponId && { couponId: couponId }),
          status: 'PENDING',
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'UNPAID',
          subtotalAmount: subtotalAmount,
          discountAmount: discountAmount,
          shippingFee: shippingFee,
          totalAmount: totalAmount,
          notes
        } as any
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

  async createVnpayPayment(userId: number, dto: ProcessPaymentDto, ipAddr: string) {
    console.log('🔍 createVnpayPayment called with:', { userId, dto, ipAddr });
    
    const { cartId, notes, couponCode } = dto;

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

    // Kiểm tra số lượng tồn kho
    for (const item of cart.items) {
      const variant = item.variant;
      if (variant && variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Biến thể "${variant.variantName}" chỉ còn ${variant.stockQuantity} sản phẩm trong kho`
        );
      }
    }

    // Tính toán tổng tiền và xử lý coupon
    const subtotalAmount = cart.items.reduce((sum, item) => 
      sum + Number(item.unitPriceSnapshot) * item.quantity, 0
    );
    
    let discountAmount = 0;
    let couponId: bigint | null = null;
    
    if (couponCode) {
      try {
        const couponValidation = await this.couponsService.validateCoupon(
          couponCode,
          userId,
          subtotalAmount
        );
        discountAmount = couponValidation.discountAmount;
        couponId = BigInt(couponValidation.coupon.id);
      } catch (error: any) {
        throw new BadRequestException(error.message || 'Mã khuyến mãi không hợp lệ');
      }
    }

    const shippingFee = 20000; // Phí vận chuyển cố định
    const totalAmount = subtotalAmount - discountAmount + shippingFee;

    // Tạo đơn hàng với status PENDING
    const order = await this.prisma.order.create({
      data: {
        orderCode: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: BigInt(userId),
        ...(couponId && { couponId: couponId }),
        status: 'PENDING',
        paymentMethod: 'VNPAY',
        paymentStatus: 'UNPAID',
        subtotalAmount: subtotalAmount,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        totalAmount: totalAmount,
        notes
      } as any
    });

    // Tạo order items
    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;
      const unitPrice = Number(item.unitPriceSnapshot);
      const totalPrice = unitPrice * item.quantity;
      
      await this.prisma.orderItem.create({
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
    }

    // Tạo VNPay payment URL
    const orderInfo = `Thanh toan don hang ${order.orderCode}`;
    console.log('🔍 Calling vnpayService.createPaymentUrl with:', {
      orderCode: order.orderCode,
      totalAmount,
      orderInfo,
      ipAddr
    });
    
    const paymentUrl = this.vnpayService.createPaymentUrl(
      order.orderCode,
      totalAmount,
      orderInfo,
      ipAddr
    );

    console.log('🔍 Payment URL created:', paymentUrl);

    return {
      success: true,
      data: {
        paymentUrl,
        orderId: Number(order.id),
        orderCode: order.orderCode,
        totalAmount
      }
    };
  }

  async handleVnpayReturn(vnp_Params: any) {
    const verification = this.vnpayService.verifyReturnUrl(vnp_Params);
    
    if (!verification.isValid) {
      throw new BadRequestException('Invalid VNPay response');
    }

    const { orderId, amount } = verification;
    
    // Tìm đơn hàng
    const order = await this.prisma.order.findFirst({
      where: { orderCode: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Cập nhật trạng thái đơn hàng
    const responseCode = vnp_Params['vnp_ResponseCode'];
    
    if (responseCode === '00') {
      // Thanh toán thành công
      await this.prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái đơn hàng
        await tx.order.update({
          where: { id: order.id },
          data: { 
            status: 'CONFIRMED',
            paymentStatus: 'PAID'
          }
        });

        // Trừ số lượng kho
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: order.id },
          include: { variant: true }
        });

        for (const item of orderItems) {
          if (item.variantId && item.variant) {
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

        // Xóa giỏ hàng
        const cart = await tx.cart.findFirst({
          where: { userId: order.userId }
        });

        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id }
          });
        }
      });

      return {
        success: true,
        message: 'Payment successful',
        data: {
          orderId: Number(order.id),
          orderCode: order.orderCode,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          amount: verification.amount,
          transactionNo: verification.transactionNo,
          bankCode: verification.bankCode,
          payDate: verification.payDate
        }
      };
    } else {
      // Thanh toán thất bại
      await this.prisma.order.update({
        where: { id: order.id },
        data: { 
          status: 'CANCELLED',
          paymentStatus: 'FAILED'
        }
      });

      return {
        success: false,
        message: 'Payment failed',
        data: {
          orderId: Number(order.id),
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
          responseCode: verification.responseCode
        }
      };
    }
  }

  getSupportedBanks() {
    return this.vnpayService.getSupportedBanks();
  }
}
