import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách đơn hàng với phân trang, tìm kiếm và lọc
   * @param params - Tham số: page, limit, search, status, paymentStatus
   * @returns Danh sách đơn hàng với thông tin phân trang
   */
  async getOrders(params: any) {
    const { page = 1, limit = 10, search, status, paymentStatus } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    try {
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true
              }
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true
                  }
                },
                variant: {
                  select: {
                    id: true,
                    variantName: true,
                    unitLabel: true
                  }
                }
              }
            },
            payment: {
              select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
              paidAt: true,
              createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.order.count({ where })
      ]);

      // Convert BigInt to string and format dates
      const processedOrders = orders.map(order => ({
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        subtotalAmount: Number(order.subtotalAmount),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user ? {
          ...order.user,
          id: order.user.id.toString()
        } : null,
        items: order.items.map(item => ({
          ...item,
          id: item.id.toString(),
          orderId: item.orderId.toString(),
          productId: item.productId.toString(),
          variantId: item.variantId?.toString(),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: {
            ...item.product,
            id: item.product.id.toString()
          },
          variant: item.variant ? {
            ...item.variant,
            id: item.variant.id.toString()
          } : null
        })),
        payment: order.payment ? {
          ...order.payment,
          id: order.payment.id.toString(),
          amount: Number(order.payment.amount),
          paidAt: order.payment.paidAt?.toISOString() || null,
          createdAt: order.payment.createdAt.toISOString()
        } : null
      }));

      return {
        orders: processedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  }

  /**
   * Lấy thông tin chi tiết một đơn hàng
   * @param id - ID của đơn hàng
   * @returns Thông tin đơn hàng
   */
  async getOrder(id: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: BigInt(id) },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
                variant: {
                  select: {
                    id: true,
                    variantName: true,
                    unitLabel: true
                  }
                }
            }
          },
          payment: {
            select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
              paidAt: true,
              createdAt: true
            }
          }
        }
      });

      if (!order) return null;

      return {
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        subtotalAmount: Number(order.subtotalAmount),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user ? {
          ...order.user,
          id: order.user.id.toString()
        } : null,
        items: order.items.map(item => ({
          ...item,
          id: item.id.toString(),
          orderId: item.orderId.toString(),
          productId: item.productId.toString(),
          variantId: item.variantId?.toString(),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: {
            ...item.product,
            id: item.product.id.toString()
          },
          variant: item.variant ? {
            ...item.variant,
            id: item.variant.id.toString()
          } : null
        })),
        payment: order.payment ? {
          ...order.payment,
          id: order.payment.id.toString(),
          amount: Number(order.payment.amount),
          createdAt: order.payment.createdAt.toISOString()
        } : null
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   * @param id - ID của đơn hàng
   * @param status - Trạng thái mới
   * @returns Đơn hàng đã cập nhật
   */
  async updateOrderStatus(id: number, status: string) {
    try {
      const order = await this.prisma.order.update({
        where: { id: BigInt(id) },
        data: { status: status as any },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
                variant: {
                  select: {
                    id: true,
                    variantName: true,
                    unitLabel: true
                  }
                }
            }
          },
            payment: {
              select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
              paidAt: true,
              createdAt: true
              }
            }
        }
      });

      return {
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        subtotalAmount: Number(order.subtotalAmount),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user ? {
          ...order.user,
          id: order.user.id.toString()
        } : null,
        items: order.items.map(item => ({
          ...item,
          id: item.id.toString(),
          orderId: item.orderId.toString(),
          productId: item.productId.toString(),
          variantId: item.variantId?.toString(),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: {
            ...item.product,
            id: item.product.id.toString()
          },
          variant: item.variant ? {
            ...item.variant,
            id: item.variant.id.toString()
          } : null
        })),
        payment: order.payment ? {
          ...order.payment,
          id: order.payment.id.toString(),
          amount: Number(order.payment.amount),
          paidAt: order.payment.paidAt?.toISOString() || null,
          createdAt: order.payment.createdAt.toISOString()
        } : null
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái thanh toán đơn hàng
   * @param id - ID của đơn hàng
   * @param paymentStatus - Trạng thái thanh toán mới
   * @returns Đơn hàng đã cập nhật
   */
  async updateOrderPaymentStatus(id: number, paymentStatus: string) {
    try {
      const order = await this.prisma.order.update({
        where: { id: BigInt(id) },
        data: { paymentStatus: paymentStatus as any },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              },
              variant: {
                select: {
                  id: true,
                  variantName: true,
                  unitLabel: true
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
              paidAt: true,
              createdAt: true
            }
          }
        }
      });

      return {
        ...order,
        id: order.id.toString(),
        userId: order.userId?.toString(),
        subtotalAmount: Number(order.subtotalAmount),
        discountAmount: Number(order.discountAmount),
        shippingFee: Number(order.shippingFee),
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        user: order.user ? {
          ...order.user,
          id: order.user.id.toString()
        } : null,
        items: order.items.map(item => ({
          ...item,
          id: item.id.toString(),
          orderId: item.orderId.toString(),
          productId: item.productId.toString(),
          variantId: item.variantId?.toString(),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: {
            ...item.product,
            id: item.product.id.toString()
          },
          variant: item.variant ? {
            ...item.variant,
            id: item.variant.id.toString()
          } : null
        })),
        payment: order.payment ? {
          ...order.payment,
          id: order.payment.id.toString(),
          amount: Number(order.payment.amount),
          paidAt: order.payment.paidAt?.toISOString() || null,
          createdAt: order.payment.createdAt.toISOString()
        } : null
      };
    } catch (error) {
      console.error('Error updating order payment status:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đơn hàng
   * @returns Thống kê đơn hàng
   */
  async getOrderStats() {
    try {
      const [
        totalOrders,
        pendingOrders,
        shippingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue
      ] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'SHIPPING' } }),
        this.prisma.order.count({ where: { status: 'COMPLETED' } }),
        this.prisma.order.count({ where: { status: 'CANCELLED' } }),
        this.prisma.order.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { totalAmount: true }
        })
      ]);

      return {
        totalOrders,
        pendingOrders,
        shippingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0)
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }
}
