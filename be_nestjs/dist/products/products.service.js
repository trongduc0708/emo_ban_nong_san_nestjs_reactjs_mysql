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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(params) {
        const page = Math.max(parseInt(params.page || '1', 10), 1);
        const limit = Math.min(Math.max(parseInt(params.limit || '12', 10), 1), 100);
        const where = { isActive: true };
        if (params.categorySlug)
            where.category = { slug: params.categorySlug };
        if (params.search)
            where.name = { contains: params.search, mode: 'insensitive' };
        if (params.minPrice || params.maxPrice) {
            where.variants = {
                some: {
                    price: {
                        ...(params.minPrice ? { gte: parseFloat(params.minPrice) } : {}),
                        ...(params.maxPrice ? { lte: parseFloat(params.maxPrice) } : {}),
                    },
                },
            };
        }
        const total = await this.prisma.product.count({ where });
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: true,
                images: { orderBy: { position: 'asc' } },
                variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const data = products.map((p) => ({
            ...p,
            id: Number(p.id),
            categoryId: p.categoryId ? Number(p.categoryId) : null,
            category: p.category
                ? {
                    ...p.category,
                    id: Number(p.category.id),
                    parentId: p.category.parentId ? Number(p.category.parentId) : null,
                }
                : null,
            images: p.images,
            variants: p.variants.map((v) => ({
                ...v,
                id: Number(v.id),
                productId: Number(v.productId),
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
            })),
        }));
        return {
            success: true,
            data: {
                products: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1,
                },
            },
        };
    }
    async detail(id) {
        if (!id || Number.isNaN(id))
            return { success: false, error: 'ID không hợp lệ' };
        const product = await this.prisma.product.findFirst({
            where: { id: BigInt(id), isActive: true },
            include: {
                category: { include: { parent: true } },
                images: { orderBy: { position: 'asc' } },
                variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
                reviews: {
                    where: { isApproved: true },
                    include: { user: { select: { fullName: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product)
            return { success: false, error: 'Sản phẩm không tồn tại' };
        const avgRating = product.reviews.length
            ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
            : 0;
        const safe = {
            ...product,
            id: Number(product.id),
            categoryId: product.categoryId ? Number(product.categoryId) : null,
            category: product.category
                ? {
                    ...product.category,
                    id: Number(product.category.id),
                    parentId: product.category.parentId ? Number(product.category.parentId) : null,
                    parent: product.category.parent
                        ? {
                            ...product.category.parent,
                            id: Number(product.category.parent.id),
                            parentId: product.category.parent.parentId
                                ? Number(product.category.parent.parentId)
                                : null,
                        }
                        : null,
                }
                : null,
            reviews: product.reviews,
            variants: product.variants.map((v) => ({
                ...v,
                id: Number(v.id),
                productId: Number(v.productId),
                price: Number(v.price),
                compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
            })),
            avgRating: Math.round(avgRating * 10) / 10,
        };
        return { success: true, data: safe };
    }
    async getFeaturedProducts(limit = 25) {
        const products = await this.prisma.product.findMany({
            where: { isActive: true },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' }, take: 1 },
                variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
                reviews: {
                    where: { isApproved: true },
                    select: { rating: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const data = products.map((p) => {
            const avgRating = p.reviews.length
                ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                : 0;
            return {
                ...p,
                id: Number(p.id),
                categoryId: p.categoryId ? Number(p.categoryId) : null,
                category: p.category
                    ? {
                        ...p.category,
                        id: Number(p.category.id),
                        parentId: p.category.parentId ? Number(p.category.parentId) : null,
                    }
                    : null,
                images: p.images,
                variants: p.variants.map((v) => ({
                    ...v,
                    id: Number(v.id),
                    productId: Number(v.productId),
                    price: Number(v.price),
                    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
                })),
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: p.reviews.length,
            };
        });
        return {
            success: true,
            data: {
                products: data,
                total: data.length
            }
        };
    }
    async getProductsByCategory(categorySlug, limit = 5) {
        const products = await this.prisma.product.findMany({
            where: {
                isActive: true,
                category: { slug: categorySlug }
            },
            include: {
                category: true,
                images: { orderBy: { position: 'asc' }, take: 1 },
                variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
                reviews: {
                    where: { isApproved: true },
                    select: { rating: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        const data = products.map((p) => {
            const avgRating = p.reviews.length
                ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                : 0;
            return {
                ...p,
                id: Number(p.id),
                categoryId: p.categoryId ? Number(p.categoryId) : null,
                category: p.category
                    ? {
                        ...p.category,
                        id: Number(p.category.id),
                        parentId: p.category.parentId ? Number(p.category.parentId) : null,
                    }
                    : null,
                images: p.images,
                variants: p.variants.map((v) => ({
                    ...v,
                    id: Number(v.id),
                    productId: Number(v.productId),
                    price: Number(v.price),
                    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
                })),
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: p.reviews.length,
            };
        });
        return {
            success: true,
            data: {
                products: data,
                categorySlug,
                total: data.length
            }
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map