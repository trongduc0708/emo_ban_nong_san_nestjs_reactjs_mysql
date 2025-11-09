import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(page?: string, limit?: string, categorySlug?: string, search?: string, sort?: string, minPrice?: string, maxPrice?: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
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
    detail(id: string): Promise<{
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
                userId: bigint;
                productId: bigint;
                isApproved: boolean;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            sku: string | null;
            description: string | null;
            origin: string | null;
            isActive: boolean;
        };
        error?: undefined;
    }>;
    getFeaturedProducts(limit?: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
            }[];
            total: number;
        };
    }>;
    getProductsByCategory(categorySlug: string, limit?: string): Promise<{
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
                createdAt: Date;
                updatedAt: Date;
                name: string;
                slug: string;
                sku: string | null;
                description: string | null;
                origin: string | null;
                isActive: boolean;
            }[];
            categorySlug: string;
            total: number;
        };
    }>;
    uploadProductImage(req: any, file: Express.Multer.File, productId: string, position?: string): Promise<{
        success: boolean;
        data: {
            imageUrl: string;
            id: number;
            position: number;
        };
    }>;
}
