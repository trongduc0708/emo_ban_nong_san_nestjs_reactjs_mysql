import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(params: {
        page?: string;
        limit?: string;
        categorySlug?: string;
        search?: string;
        sort?: string;
        minPrice?: string;
        maxPrice?: string;
    }): Promise<{
        success: boolean;
        data: {
            products: {
                id: number;
                categoryId: number | null;
                category: {
                    id: number;
                    parentId: number | null;
                    name: string;
                    slug: string;
                    description: string | null;
                    isActive: boolean;
                    position: number;
                } | null;
                images: {
                    id: bigint;
                    position: number;
                    productId: bigint;
                    imageUrl: string;
                }[];
                variants: {
                    id: number;
                    productId: number;
                    price: number;
                    compareAtPrice: number | null;
                    isActive: boolean;
                    variantName: string;
                    unitLabel: string | null;
                    stockQuantity: number;
                }[];
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasNextPage: boolean;
                hasPrevPage: boolean;
            };
        };
    }>;
    detail(id: number): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: number;
            categoryId: number | null;
            category: {
                id: number;
                parentId: number | null;
                parent: {
                    id: number;
                    parentId: number | null;
                    name: string;
                    slug: string;
                    description: string | null;
                    isActive: boolean;
                    position: number;
                } | null;
                name: string;
                slug: string;
                description: string | null;
                isActive: boolean;
                position: number;
            } | null;
            reviews: ({
                user: {
                    fullName: string;
                    avatarUrl: string | null;
                };
            } & {
                id: bigint;
                createdAt: Date;
                productId: bigint;
                isApproved: boolean;
                userId: bigint;
                orderId: bigint | null;
                rating: number;
                comment: string | null;
                imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            })[];
            variants: {
                id: number;
                productId: number;
                price: number;
                compareAtPrice: number | null;
                isActive: boolean;
                variantName: string;
                unitLabel: string | null;
                stockQuantity: number;
            }[];
            avgRating: number;
            images: {
                id: bigint;
                position: number;
                productId: bigint;
                imageUrl: string;
            }[];
            name: string;
            slug: string;
            sku: string | null;
            description: string | null;
            origin: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        error?: undefined;
    }>;
    getFeaturedProducts(limit?: number): Promise<{
        success: boolean;
        data: {
            products: {
                id: number;
                categoryId: number | null;
                category: {
                    id: number;
                    parentId: number | null;
                    name: string;
                    slug: string;
                    description: string | null;
                    isActive: boolean;
                    position: number;
                } | null;
                images: {
                    id: bigint;
                    position: number;
                    productId: bigint;
                    imageUrl: string;
                }[];
                variants: {
                    id: number;
                    productId: number;
                    price: number;
                    compareAtPrice: number | null;
                    isActive: boolean;
                    variantName: string;
                    unitLabel: string | null;
                    stockQuantity: number;
                }[];
                avgRating: number;
                reviewCount: number;
                reviews: {
                    rating: number;
                }[];
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            total: number;
        };
    }>;
    getProductsByCategory(categorySlug: string, limit?: number): Promise<{
        success: boolean;
        data: {
            products: {
                id: number;
                categoryId: number | null;
                category: {
                    id: number;
                    parentId: number | null;
                    name: string;
                    slug: string;
                    description: string | null;
                    isActive: boolean;
                    position: number;
                } | null;
                images: {
                    id: bigint;
                    position: number;
                    productId: bigint;
                    imageUrl: string;
                }[];
                variants: {
                    id: number;
                    productId: number;
                    price: number;
                    compareAtPrice: number | null;
                    isActive: boolean;
                    variantName: string;
                    unitLabel: string | null;
                    stockQuantity: number;
                }[];
                avgRating: number;
                reviewCount: number;
                reviews: {
                    rating: number;
                }[];
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            }[];
            categorySlug: string;
            total: number;
        };
    }>;
    addProductImage(productId: number, imageUrl: string, position: number): Promise<{
        id: number;
        productId: number;
        imageUrl: string;
        position: number;
    }>;
}
