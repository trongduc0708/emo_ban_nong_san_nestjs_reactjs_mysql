import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(userId: number): Promise<{
        success: boolean;
        data: {
            id: number;
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
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                cartId: bigint;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
    addToCart(userId: number, dto: AddToCartDto): Promise<{
        success: boolean;
        data: {
            id: number;
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
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                cartId: bigint;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
    updateCartItem(userId: number, itemId: number, dto: UpdateCartItemDto): Promise<{
        success: boolean;
        data: {
            id: number;
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
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                cartId: bigint;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
    removeFromCart(userId: number, itemId: number): Promise<{
        success: boolean;
        data: {
            id: number;
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
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                cartId: bigint;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
    clearCart(userId: number): Promise<{
        success: boolean;
        data: {
            id: number;
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
                productId: bigint;
                variantId: bigint | null;
                quantity: number;
                cartId: bigint;
                unitPriceSnapshot: import("@prisma/client/runtime/library").Decimal;
            })[];
        };
    }>;
}
