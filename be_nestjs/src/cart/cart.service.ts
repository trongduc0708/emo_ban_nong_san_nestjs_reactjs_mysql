import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number) {
    console.log('Getting cart for userId:', userId);
    
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

    console.log('Cart found:', cart);
    console.log('Cart items:', cart?.items);

    return { success: true, data: { items: cart?.items ?? [] } };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    const { productId, variantId, quantity } = dto;
    console.log('Adding to cart:', { userId, productId, variantId, quantity });

    // LƯU Ý: Chỉ kiểm tra sản phẩm tồn tại, KHÔNG trừ số lượng kho
    // Số lượng kho chỉ được trừ khi thanh toán thành công
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    console.log('Product found:', product);
    console.log('Product variants:', product.variants);

    // Kiểm tra variant nếu có
    let selectedVariant = null;
    if (variantId) {
      selectedVariant = await this.prisma.productVariant.findFirst({
        where: { id: variantId, productId },
      });
      if (!selectedVariant) {
        throw new BadRequestException('Biến thể sản phẩm không tồn tại');
      }
      console.log('Selected variant:', selectedVariant);
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await this.prisma.cart.findFirst({
      where: { userId: BigInt(userId) },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId: BigInt(userId) },
      });
    }

    // Kiểm tra item đã tồn tại trong giỏ hàng
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Cập nhật số lượng
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Thêm item mới
      let price = 0;
      if (selectedVariant) {
        price = Number(selectedVariant.price);
      } else if (product.variants && product.variants.length > 0) {
        price = Number(product.variants[0].price);
      }

      console.log('Calculated price:', price);

      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          unitPriceSnapshot: price,
        },
      });
    }

    // Trả về toàn bộ giỏ hàng sau khi thêm
    return this.getCart(userId);
  }

  async updateCartItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const { quantity } = dto;

    // Kiểm tra item thuộc về user
    const cart = await this.prisma.cart.findFirst({
      where: { userId: BigInt(userId) },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Sản phẩm không tồn tại trong giỏ hàng');
    }

    if (quantity === 0) {
      // Xóa item nếu quantity = 0
      await this.prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      // Cập nhật quantity
      await this.prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    // Trả về toàn bộ giỏ hàng sau khi cập nhật
    return this.getCart(userId);
  }

  async removeFromCart(userId: number, itemId: number) {
    // Kiểm tra item thuộc về user
    const cart = await this.prisma.cart.findFirst({
      where: { userId: BigInt(userId) },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Sản phẩm không tồn tại trong giỏ hàng');
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    // Trả về toàn bộ giỏ hàng sau khi xóa
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId: BigInt(userId) },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    // Trả về giỏ hàng trống sau khi xóa
    return this.getCart(userId);
  }
}
