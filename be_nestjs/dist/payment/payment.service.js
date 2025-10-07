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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentService = class PaymentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processPayment(userId, dto) {
        const { cartId, paymentMethod = 'COD', notes } = dto;
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
            throw new common_1.NotFoundException('Giỏ hàng không tồn tại');
        }
        if (cart.items.length === 0) {
            throw new common_1.BadRequestException('Giỏ hàng trống');
        }
        for (const item of cart.items) {
            const product = item.product;
            const variant = item.variant;
            if (variant && variant.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Biến thể "${variant.variantName}" của sản phẩm "${product.name}" chỉ còn ${variant.stockQuantity} sản phẩm trong kho`);
            }
        }
        return await this.prisma.$transaction(async (tx) => {
            const totalAmount = cart.items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);
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
            for (const item of cart.items) {
                const product = item.product;
                const variant = item.variant;
                const unitPrice = Number(item.unitPriceSnapshot);
                const totalPrice = unitPrice * item.quantity;
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
    async getOrderHistory(userId) {
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map