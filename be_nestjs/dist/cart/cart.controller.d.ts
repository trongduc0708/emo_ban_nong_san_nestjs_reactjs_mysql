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
                    name: string;
                    id: bigint;
                    createdAt: Date;
                    updatedAt: Date;
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
                productId: bigint;
                cartId: bigint;
                variantId: bigint | null;
                quantity: number;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
}
