import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Response } from 'express';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    processPayment(req: any, dto: ProcessPaymentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            orderId: number;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderStatus;
        };
    }>;
    getOrderHistory(req: any): Promise<{
        success: boolean;
        data: {
            orders: ({
                items: ({
                    product: {
                        images: {
                            id: bigint;
                            position: number;
                            productId: bigint;
                            imageUrl: string;
                        }[];
                    } & {
                        id: bigint;
                        createdAt: Date;
                        updatedAt: Date;
                        name: string;
                        categoryId: bigint | null;
                        slug: string;
                        sku: string | null;
                        description: string | null;
                        origin: string | null;
                        isActive: boolean;
                    };
                    variant: {
                        id: bigint;
                        isActive: boolean;
                        price: import("@prisma/client/runtime/library").Decimal;
                        productId: bigint;
                        variantName: string;
                        unitLabel: string | null;
                        compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                        stockQuantity: number;
                    } | null;
                } & {
                    id: bigint;
                    sku: string | null;
                    productId: bigint;
                    variantName: string | null;
                    orderId: bigint;
                    variantId: bigint | null;
                    quantity: number;
                    productName: string;
                    unitPrice: import("@prisma/client/runtime/library").Decimal;
                    totalPrice: import("@prisma/client/runtime/library").Decimal;
                })[];
            } & {
                id: bigint;
                createdAt: Date;
                updatedAt: Date;
                userId: bigint | null;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                notes: string | null;
                status: import(".prisma/client").$Enums.OrderStatus;
                orderCode: string;
                paymentStatus: import(".prisma/client").$Enums.OrderPaymentStatus;
                subtotalAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                shippingFee: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
        };
    }>;
    createVnpayPayment(req: any, dto: ProcessPaymentDto): Promise<{
        success: boolean;
        data: {
            paymentUrl: string;
            orderId: number;
            orderCode: string;
            totalAmount: number;
        };
    }>;
    vnpayReturn(query: any, res: Response): Promise<void>;
    vnpayIpn(body: any): Promise<{
        RspCode: string;
        Message: string;
    }>;
}
