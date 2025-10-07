"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        console.log('Getting cart for userId:', userId);
        let cart = await this.prisma.cart.findFirst({
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
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId: BigInt(userId) },
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
        }
        console.log('Cart found:', cart);
        console.log('Cart items:', cart?.items);
        return { success: true, data: { id: Number(cart.id), items: cart?.items ?? [] } };
    }
    async addToCart(userId, dto) {
        const { productId, variantId, quantity } = dto;
        console.log('Adding to cart:', { userId, productId, variantId, quantity });
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại');
        }
        console.log('Product found:', product);
        console.log('Product variants:', product.variants);
        let selectedVariant = null;
        if (variantId) {
            selectedVariant = await this.prisma.productVariant.findFirst({
                where: { id: variantId, productId },
            });
            if (!selectedVariant) {
                throw new common_1.BadRequestException('Biến thể sản phẩm không tồn tại');
            }
            console.log('Selected variant:', selectedVariant);
        }
        let cart = await this.prisma.cart.findFirst({
            where: { userId: BigInt(userId) },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId: BigInt(userId) },
            });
        }
        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variantId: variantId || null,
            },
        });
        if (existingItem) {
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        }
        else {
            let price = 0;
            if (selectedVariant) {
                price = Number(selectedVariant.price);
            }
            else if (product.variants && product.variants.length > 0) {
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
        return this.getCart(userId);
    }
    async updateCartItem(userId, itemId, dto) {
        const { quantity } = dto;
        const cart = await this.prisma.cart.findFirst({
            where: { userId: BigInt(userId) },
        });
        if (!cart) {
            throw new common_1.NotFoundException('Giỏ hàng không tồn tại');
        }
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại trong giỏ hàng');
        }
        if (quantity === 0) {
            await this.prisma.cartItem.delete({ where: { id: itemId } });
        }
        else {
            await this.prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
        }
        return this.getCart(userId);
    }
    async removeFromCart(userId, itemId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId: BigInt(userId) },
        });
        if (!cart) {
            throw new common_1.NotFoundException('Giỏ hàng không tồn tại');
        }
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('Sản phẩm không tồn tại trong giỏ hàng');
        }
        await this.prisma.cartItem.delete({ where: { id: itemId } });
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId: BigInt(userId) },
        });
        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
        return this.getCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map