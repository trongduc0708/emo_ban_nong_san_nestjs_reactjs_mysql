import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: number) {
    // Find or create wishlist for user
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId: BigInt(userId) },
      });
    }

    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          include: {
            category: true,
            images: { orderBy: { position: 'asc' }, take: 1 },
            variants: { take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: wishlistItems.map(item => ({
        id: Number(item.id),
        productId: Number(item.productId),
        userId: Number(userId),
        createdAt: item.createdAt,
        product: {
          id: Number(item.product.id),
          name: item.product.name,
          description: item.product.description,
          category: item.product.category ? {
            id: Number(item.product.category.id),
            name: item.product.category.name,
          } : null,
          images: item.product.images.map(img => ({
            imageUrl: img.imageUrl,
          })),
          variants: item.product.variants.map(variant => ({
            id: Number(variant.id),
            variantName: variant.variantName,
            price: Number(variant.price),
            compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          })),
          avgRating: 0, // Default rating - will be calculated from reviews
          reviewCount: 0, // Default review count - will be calculated from reviews
        },
      })),
    };
  }

  async addToWishlist(userId: number, productId: number) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Find or create wishlist for user
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId: BigInt(userId) },
      });
    }

    // Check if already in wishlist
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId: BigInt(productId),
      },
    });

    if (existingItem) {
      throw new BadRequestException('Sản phẩm đã có trong danh sách yêu thích');
    }

    // Add to wishlist
    await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: BigInt(productId),
      },
    });

    return {
      success: true,
      message: 'Đã thêm vào danh sách yêu thích',
    };
  }

  async removeFromWishlist(userId: number, productId: number) {
    // Find user's wishlist
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!wishlist) {
      throw new NotFoundException('Danh sách yêu thích không tồn tại');
    }

    // Find wishlist item
    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId: BigInt(productId),
      },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Sản phẩm không có trong danh sách yêu thích');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return {
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
    };
  }
}
