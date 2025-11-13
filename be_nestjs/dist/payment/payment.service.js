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
const vnpay_service_1 = require("./vnpay.service");
const coupons_service_1 = require("../coupons/coupons.service");
let PaymentService = class PaymentService {
    prisma;
    vnpayService;
    couponsService;
    constructor(prisma, vnpayService, couponsService) {
        this.prisma = prisma;
        this.vnpayService = vnpayService;
        this.couponsService = couponsService;
    }
    async processPayment(userId, dto) {
        const { cartId, paymentMethod = 'COD', notes, couponCode } = dto;
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
        const subtotalAmount = cart.items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);
        let discountAmount = 0;
        let couponId = null;
        if (couponCode) {
            try {
                const couponValidation = await this.couponsService.validateCoupon(couponCode, userId, subtotalAmount);
                discountAmount = couponValidation.discountAmount;
                couponId = BigInt(couponValidation.coupon.id);
            }
            catch (error) {
                throw new common_1.BadRequestException(error.message || 'Mã khuyến mãi không hợp lệ');
            }
        }
        const shippingFee = 20000;
        const totalAmount = subtotalAmount - discountAmount + shippingFee;
        return await this.prisma.$transaction(async (tx) => {
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
    async createVnpayPayment(userId, dto, ipAddr) {
        console.log('🔍 createVnpayPayment called with:', { userId, dto, ipAddr });
        const { cartId, notes, couponCode } = dto;
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
            const variant = item.variant;
            if (variant && variant.stockQuantity < item.quantity) {
                throw new common_1.BadRequestException(`Biến thể "${variant.variantName}" chỉ còn ${variant.stockQuantity} sản phẩm trong kho`);
            }
        }
        const subtotalAmount = cart.items.reduce((sum, item) => sum + Number(item.unitPriceSnapshot) * item.quantity, 0);
        let discountAmount = 0;
        let couponId = null;
        if (couponCode) {
            try {
                const couponValidation = await this.couponsService.validateCoupon(couponCode, userId, subtotalAmount);
                discountAmount = couponValidation.discountAmount;
                couponId = BigInt(couponValidation.coupon.id);
            }
            catch (error) {
                throw new common_1.BadRequestException(error.message || 'Mã khuyến mãi không hợp lệ');
            }
        }
        const shippingFee = 20000;
        const totalAmount = subtotalAmount - discountAmount + shippingFee;
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
            }
        });
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
        const orderInfo = `Thanh toan don hang ${order.orderCode}`;
        console.log('🔍 Calling vnpayService.createPaymentUrl with:', {
            orderCode: order.orderCode,
            totalAmount,
            orderInfo,
            ipAddr
        });
        const paymentUrl = this.vnpayService.createPaymentUrl(order.orderCode, totalAmount, orderInfo, ipAddr);
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
    async handleVnpayReturn(vnp_Params) {
        const verification = this.vnpayService.verifyReturnUrl(vnp_Params);
        if (!verification.isValid) {
            throw new common_1.BadRequestException('Invalid VNPay response');
        }
        const { orderId, amount } = verification;
        const order = await this.prisma.order.findFirst({
            where: { orderCode: orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const responseCode = vnp_Params['vnp_ResponseCode'];
        if (responseCode === '00') {
            await this.prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID'
                    }
                });
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
                    status: 'CONFIRMED'
                }
            };
        }
        else {
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
                    paymentStatus: 'FAILED'
                }
            };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vnpay_service_1.VnpayService,
        coupons_service_1.CouponsService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map