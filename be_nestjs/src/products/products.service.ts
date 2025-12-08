import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    page?: string;
    limit?: string;
    categorySlug?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }) {
    const page = Math.max(parseInt(params.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(params.limit || '12', 10), 1), 100);

    const where: any = { isActive: true };
    if (params.categorySlug) where.category = { slug: params.categorySlug };
    if (params.search) where.name = { contains: params.search, mode: 'insensitive' };
    if (params.minPrice || params.maxPrice) {
      where.variants = {
        some: {
          price: {
            ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
            ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
          },
        },
      };
    }

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = products.map((p) => ({
      ...p,
      id: Number(p.id),
      categoryId: p.categoryId ? Number(p.categoryId) : null,
      category: p.category
        ? {
            ...p.category,
            id: Number(p.category.id),
            parentId: p.category.parentId ? Number(p.category.parentId) : null,
          }
        : null,
      images: p.images,
      variants: p.variants.map((v) => ({
        ...v,
        id: Number(v.id),
        productId: Number(v.productId),
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
      })),
    }));

    return {
      success: true,
      data: {
        products: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    };
  }

  async detail(id: number) {
    if (!id || Number.isNaN(id)) return { success: false, error: 'ID không hợp lệ' };

    const product = await this.prisma.product.findFirst({
      where: { id: BigInt(id), isActive: true },
      include: {
        category: { include: { parent: true } },
        images: { orderBy: { position: 'asc' } },
      variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) return { success: false, error: 'Sản phẩm không tồn tại' };

    const avgRating = product.reviews.length
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

    const safe = {
      ...product,
      id: Number(product.id),
      categoryId: product.categoryId ? Number(product.categoryId) : null,
      category: product.category
        ? {
            ...product.category,
            id: Number(product.category.id),
            parentId: product.category.parentId ? Number(product.category.parentId) : null,
            parent: product.category.parent
              ? {
                  ...product.category.parent,
                  id: Number(product.category.parent.id),
                  parentId: product.category.parent.parentId
                    ? Number(product.category.parent.parentId)
                    : null,
                }
              : null,
          }
        : null,
      reviews: product.reviews.map((r: any) => ({
        ...r,
        id: Number(r.id),
        userId: Number(r.userId),
        productId: Number(r.productId),
        orderId: r.orderId ? Number(r.orderId) : null,
        rating: Number(r.rating),
        createdAt: r.createdAt,
        user: r.user,
      })),
      variants: product.variants.map((v) => ({
        ...v,
        id: Number(v.id),
        productId: Number(v.productId),
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
      })),
      avgRating: Math.round(avgRating * 10) / 10,
    };

    return { success: true, data: safe };
  }

  async getFeaturedProducts(limit: number = 25) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const data = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0;

      return {
        ...p,
        id: Number(p.id),
        categoryId: p.categoryId ? Number(p.categoryId) : null,
        category: p.category
          ? {
              ...p.category,
              id: Number(p.category.id),
              parentId: p.category.parentId ? Number(p.category.parentId) : null,
            }
          : null,
        images: p.images,
        variants: p.variants.map((v) => ({
          ...v,
          id: Number(v.id),
          productId: Number(v.productId),
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
        })),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
      };
    });

    return {
      success: true,
      data: {
        products: data,
        total: data.length
      }
    };
  }

  async getProductsByCategory(categorySlug: string, limit: number = 5) {
    const products = await this.prisma.product.findMany({
      where: { 
        isActive: true,
        category: { slug: categorySlug }
      },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' }, take: 1 },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const data = products.map((p) => {
      const avgRating = p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0;

      return {
        ...p,
        id: Number(p.id),
        categoryId: p.categoryId ? Number(p.categoryId) : null,
        category: p.category
          ? {
              ...p.category,
              id: Number(p.category.id),
              parentId: p.category.parentId ? Number(p.category.parentId) : null,
            }
          : null,
        images: p.images,
        variants: p.variants.map((v) => ({
          ...v,
          id: Number(v.id),
          productId: Number(v.productId),
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
        })),
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: p.reviews.length,
      };
    });

    return {
      success: true,
      data: {
        products: data,
        categorySlug,
        total: data.length
      }
    };
  }

  async addProductImage(productId: number, imageUrl: string, position: number) {
    const productImage = await this.prisma.productImage.create({
      data: {
        productId: BigInt(productId),
        imageUrl,
        position,
      },
    });

    return {
      id: Number(productImage.id),
      productId: Number(productImage.productId),
      imageUrl: productImage.imageUrl,
      position: productImage.position,
    };
  }

  async createReview(userId: number, productId: number, data: { rating: number; comment?: string; orderId?: number; images?: string[] }) {
    // 1. Kiểm tra sản phẩm tồn tại
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(productId) },
    });

    if (!product) {
      throw new Error('Sản phẩm không tồn tại');
    }

    // 2. Kiểm tra user đã đánh giá sản phẩm này chưa
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId: BigInt(userId),
        productId: BigInt(productId),
      },
    });

    if (existingReview) {
      throw new Error('Bạn đã đánh giá sản phẩm này rồi. Mỗi khách hàng chỉ được đánh giá 1 lần cho mỗi sản phẩm.');
    }

    // 3. Kiểm tra user đã mua sản phẩm này chưa (nếu có orderId)
    if (data.orderId) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: BigInt(data.orderId),
          userId: BigInt(userId),
          status: 'COMPLETED',
        },
        include: {
          items: {
            where: {
              productId: BigInt(productId),
            },
          },
        },
      });

      if (!order) {
        throw new Error('Đơn hàng không tồn tại hoặc chưa hoàn thành');
      }

      if (order.items.length === 0) {
        throw new Error('Bạn chưa mua sản phẩm này. Chỉ khách hàng đã mua và đơn hàng đã hoàn thành mới được đánh giá.');
      }
    } else {
      // Nếu không có orderId, kiểm tra user có đơn hàng COMPLETED chứa sản phẩm này không
      const completedOrder = await this.prisma.order.findFirst({
        where: {
          userId: BigInt(userId),
          status: 'COMPLETED',
          items: {
            some: {
              productId: BigInt(productId),
            },
          },
        },
      });

      if (!completedOrder) {
        throw new Error('Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành. Chỉ khách hàng đã mua và đơn hàng đã hoàn thành mới được đánh giá.');
      }
    }

    // 4. Tạo review
    const reviewData: any = {
      userId: BigInt(userId),
      productId: BigInt(productId),
      orderId: data.orderId ? BigInt(data.orderId) : null,
      rating: data.rating,
      comment: data.comment || null,
      isApproved: false, // Cần admin phê duyệt
    };

    // Chỉ set imagesJson nếu có images
    if (data.images && data.images.length > 0) {
      reviewData.imagesJson = JSON.stringify(data.images);
    }

    const review = await this.prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      id: Number(review.id),
      userId: Number(review.userId),
      productId: Number(review.productId),
      orderId: review.orderId ? Number(review.orderId) : null,
      rating: review.rating,
      comment: review.comment,
      imagesJson: review.imagesJson ? (typeof review.imagesJson === 'string' ? JSON.parse(review.imagesJson) : review.imagesJson) : null,
      isApproved: review.isApproved,
      createdAt: review.createdAt,
      user: {
        id: Number(review.user.id),
        fullName: review.user.fullName,
        avatarUrl: review.user.avatarUrl,
      },
    };
  }
}
