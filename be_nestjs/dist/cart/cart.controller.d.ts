import { PrismaService } from '../prisma/prisma.service';
export declare class CartController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(req: any): Promise<{
        success: boolean;
        data: {
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
                    productId: bigint;
                    isActive: boolean;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                } | null;
            } & {
                id: bigint;
                cartId: bigint;
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
}
