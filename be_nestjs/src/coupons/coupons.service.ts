import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy danh sách coupons với phân trang, tìm kiếm và lọc
   * @param params - Tham số: page, limit, search, status, type
   * @returns Danh sách coupons với thông tin phân trang
   */
  async getCoupons(params: any) {
    const { page = 1, limit = 10, search, status, type } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.isActive = status === 'active';
    }
    if (type) {
      where.type = type;
    }

    try {
      const [coupons, total] = await Promise.all([
        this.prisma.coupon.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.coupon.count({ where })
      ]);

      // Convert BigInt to string and format dates
      const processedCoupons = coupons.map(coupon => ({
        ...coupon,
        id: coupon.id.toString(),
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
        endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null
      }));

      return {
        coupons: processedCoupons,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return { coupons: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  }

  /**
   * Lấy thông tin chi tiết một coupon
   * @param id - ID của coupon
   * @returns Thông tin coupon
   */
  async getCoupon(id: number) {
    try {
      const coupon = await this.prisma.coupon.findUnique({
        where: { id: BigInt(id) },
      });

      if (!coupon) return null;

      return {
        ...coupon,
        id: coupon.id.toString(),
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
        endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null
      };
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  }

  /**
   * Tạo coupon mới
   * @param data - Dữ liệu coupon
   * @returns Coupon vừa tạo
   */
  async createCoupon(data: any) {
    try {
      // Clean and validate data
      const createData: any = {
        code: data.code,
        type: data.type,
        value: Number(data.value),
        isActive: data.isActive !== undefined ? data.isActive : true
      }

      // Handle optional fields safely
      if (data.minOrderAmount !== null && data.minOrderAmount !== undefined && data.minOrderAmount !== '') {
        createData.minOrderAmount = Number(data.minOrderAmount)
      } else {
        createData.minOrderAmount = null
      }

      if (data.maxDiscountAmount !== null && data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== '') {
        createData.maxDiscountAmount = Number(data.maxDiscountAmount)
      } else {
        createData.maxDiscountAmount = null
      }

      if (data.usageLimit !== null && data.usageLimit !== undefined && data.usageLimit !== '') {
        createData.usageLimit = Number(data.usageLimit)
      } else {
        createData.usageLimit = null
      }

      if (data.startsAt) {
        createData.startsAt = new Date(data.startsAt)
      } else {
        createData.startsAt = null
      }

      if (data.endsAt) {
        createData.endsAt = new Date(data.endsAt)
      } else {
        createData.endsAt = null
      }

      const coupon = await this.prisma.coupon.create({
        data: createData
      });

      return {
        ...coupon,
        id: coupon.id.toString(),
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
        endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null
      };
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  /**
   * Cập nhật coupon
   * @param id - ID của coupon cần cập nhật
   * @param data - Dữ liệu mới
   * @returns Coupon đã cập nhật
   */
  async updateCoupon(id: number, data: any) {
    try {
      // Clean and validate data
      const updateData: any = {
        code: data.code,
        type: data.type,
        value: Number(data.value),
        isActive: data.isActive !== undefined ? data.isActive : true
      }

      // Handle optional fields safely
      if (data.minOrderAmount !== null && data.minOrderAmount !== undefined && data.minOrderAmount !== '') {
        updateData.minOrderAmount = Number(data.minOrderAmount)
      } else {
        updateData.minOrderAmount = null
      }

      if (data.maxDiscountAmount !== null && data.maxDiscountAmount !== undefined && data.maxDiscountAmount !== '') {
        updateData.maxDiscountAmount = Number(data.maxDiscountAmount)
      } else {
        updateData.maxDiscountAmount = null
      }

      if (data.usageLimit !== null && data.usageLimit !== undefined && data.usageLimit !== '') {
        updateData.usageLimit = Number(data.usageLimit)
      } else {
        updateData.usageLimit = null
      }

      if (data.startsAt) {
        updateData.startsAt = new Date(data.startsAt)
      } else {
        updateData.startsAt = null
      }

      if (data.endsAt) {
        updateData.endsAt = new Date(data.endsAt)
      } else {
        updateData.endsAt = null
      }

      const coupon = await this.prisma.coupon.update({
        where: { id: BigInt(id) },
        data: updateData
      });

      return {
        ...coupon,
        id: coupon.id.toString(),
        value: Number(coupon.value),
        minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
        maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
        startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
        endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null
      };
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  }

  /**
   * Xóa coupon
   * @param id - ID của coupon cần xóa
   * @returns Coupon đã xóa
   */
  async deleteCoupon(id: number) {
    try {
      // Check if coupon has been used
      // TODO: Implement coupon usage tracking when Order-Coupon relationship is added
      // const orderCount = await this.prisma.order.count({
      //   where: { couponId: BigInt(id) }
      // });

      // if (orderCount > 0) {
      //   throw new Error('Không thể xóa coupon đã được sử dụng');
      // }

      return await this.prisma.coupon.delete({
        where: { id: BigInt(id) }
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra tính hợp lệ của coupon
   * @param code - Mã coupon
   * @param userId - ID người dùng
   * @param orderAmount - Tổng tiền đơn hàng
   * @returns Thông tin coupon và mức giảm giá
   */
  async validateCoupon(code: string, userId: number, orderAmount: number) {
    try {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: code,
          isActive: true,
          startsAt: { lte: new Date() },
          endsAt: { gte: new Date() }
        }
      });

      if (!coupon) {
        throw new Error('Coupon không hợp lệ hoặc đã hết hạn');
      }

      // Check usage limit
      // TODO: Implement usage tracking when Order-Coupon relationship is added
      // if (coupon.usageLimit) {
      //   const usedCount = await this.prisma.order.count({
      //     where: { couponId: coupon.id }
      //   });

      //   if (usedCount >= coupon.usageLimit) {
      //     throw new Error('Coupon đã hết lượt sử dụng');
      //   }
      // }

      // Check minimum amount
      if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
        throw new Error(`Đơn hàng tối thiểu ${Number(coupon.minOrderAmount).toLocaleString('vi-VN')}₫`);
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.type === 'PERCENT') {
        discountAmount = (orderAmount * Number(coupon.value)) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
        }
      } else {
        discountAmount = Number(coupon.value);
      }

      return {
        coupon: {
          ...coupon,
          id: coupon.id.toString(),
          value: Number(coupon.value),
          minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
          maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
          startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,
          endsAt: coupon.endsAt ? coupon.endsAt.toISOString() : null
        },
        discountAmount: Math.min(discountAmount, orderAmount)
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  }
}
