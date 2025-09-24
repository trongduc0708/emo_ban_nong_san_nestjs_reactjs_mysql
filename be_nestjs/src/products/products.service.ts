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
      reviews: product.reviews,
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
}
