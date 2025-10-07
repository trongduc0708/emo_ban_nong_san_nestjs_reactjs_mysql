import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
        success: boolean;
        data: {
            id: number;
            items: ({
                variant: {
                    id: bigint;
                    productId: bigint;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                    isActive: boolean;
                } | null;
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
                    isActive: boolean;
                    categoryId: bigint | null;
                    slug: string;
                    sku: string | null;
                    description: string | null;
                    origin: string | null;
                };
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
    addToCart(req: any, dto: AddToCartDto): Promise<{
        success: boolean;
        data: {
            id: number;
            items: ({
                variant: {
                    id: bigint;
                    productId: bigint;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                    isActive: boolean;
                } | null;
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
                    isActive: boolean;
                    categoryId: bigint | null;
                    slug: string;
                    sku: string | null;
                    description: string | null;
                    origin: string | null;
                };
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
    updateCartItem(req: any, id: string, dto: UpdateCartItemDto): Promise<{
        success: boolean;
        data: {
            id: number;
            items: ({
                variant: {
                    id: bigint;
                    productId: bigint;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                    isActive: boolean;
                } | null;
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
                    isActive: boolean;
                    categoryId: bigint | null;
                    slug: string;
                    sku: string | null;
                    description: string | null;
                    origin: string | null;
                };
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
    removeFromCart(req: any, id: string): Promise<{
        success: boolean;
        data: {
            id: number;
            items: ({
                variant: {
                    id: bigint;
                    productId: bigint;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                    isActive: boolean;
                } | null;
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
                    isActive: boolean;
                    categoryId: bigint | null;
                    slug: string;
                    sku: string | null;
                    description: string | null;
                    origin: string | null;
                };
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
    clearCart(req: any): Promise<{
        success: boolean;
        data: {
            id: number;
            items: ({
                variant: {
                    id: bigint;
                    productId: bigint;
                    variantName: string;
                    unitLabel: string | null;
                    price: import("@prisma/client/runtime/library").Decimal;
                    compareAtPrice: import("@prisma/client/runtime/library").Decimal | null;
                    stockQuantity: number;
                    isActive: boolean;
                } | null;
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
                    isActive: boolean;
                    categoryId: bigint | null;
                    slug: string;
                    sku: string | null;
                    description: string | null;
                    origin: string | null;
                };
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
