import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { VnpayService } from './vnpay.service';
export declare class PaymentService {
    private readonly prisma;
    private readonly vnpayService;
    constructor(prisma: PrismaService, vnpayService: VnpayService);
    processPayment(userId: number, dto: ProcessPaymentDto): Promise<{
        success: boolean;
        message: string;
        data: {
            orderId: number;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            status: import(".prisma/client").$Enums.OrderStatus;
        };
    }>;
    getOrderHistory(userId: number): Promise<{
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
                orderCode: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                paymentStatus: import(".prisma/client").$Enums.OrderPaymentStatus;
                subtotalAmount: import("@prisma/client/runtime/library").Decimal;
                discountAmount: import("@prisma/client/runtime/library").Decimal;
                shippingFee: import("@prisma/client/runtime/library").Decimal;
                totalAmount: import("@prisma/client/runtime/library").Decimal;
                shippingAddressSnapshot: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
        };
    }>;
    createVnpayPayment(userId: number, dto: ProcessPaymentDto, ipAddr: string): Promise<{
        success: boolean;
        data: {
            paymentUrl: string;
            orderId: number;
            orderCode: string;
            totalAmount: number;
        };
    }>;
    handleVnpayReturn(vnp_Params: any): Promise<{
        success: boolean;
        message: string;
        data: {
            orderId: number;
            status: string;
        };
    }>;
}
