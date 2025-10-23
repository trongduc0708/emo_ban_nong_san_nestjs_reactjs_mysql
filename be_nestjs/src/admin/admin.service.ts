import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    return { message: 'Admin dashboard stats' };
  }

  /**
   * Lấy danh sách sản phẩm với phân trang, tìm kiếm và lọc
   * @param params - Tham số: page, limit, search, category, status
   * @returns Danh sách sản phẩm với thông tin phân trang
   */
  async getProducts(params: any) {
    const { page = 1, limit = 10, search, category, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.categoryId = parseInt(category);
    }
    if (status) {
      where.isActive = status === 'active';
    }

    try {
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            category: { select: { id: true, name: true, slug: true } },
            variants: { 
              select: { 
                id: true,
                variantName: true,
                unitLabel: true,
                price: true,
                compareAtPrice: true,
                stockQuantity: true,
                isActive: true
              },
              orderBy: { id: 'asc' }
            },
            images: { 
              select: { id: true, imageUrl: true, position: true },
              orderBy: { position: 'asc' }
            },
            _count: { 
              select: { 
                orderItems: true,
                variants: true,
                images: true
              } 
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.product.count({ where })
      ]);

      
      // Convert BigInt to string and handle DECIMAL types
      const processedProducts = products.map(product => ({
        ...product,
        id: product.id.toString(),
        categoryId: product.categoryId?.toString(),
        variants: product.variants.map(variant => ({
          ...variant,
          id: variant.id.toString(),
          price: Number(variant.price), // Convert DECIMAL to number
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          stockQuantity: Number(variant.stockQuantity)
        })),
        images: product.images.map(image => ({
          ...image,
          id: image.id.toString()
        }))
      }));

      return {
        products: processedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
    }
  }

  /**
   * Lấy thông tin chi tiết một sản phẩm
   * @param id - ID của sản phẩm
   * @returns Thông tin sản phẩm với category, variants, images
   */
  async getProduct(id: number) {
    try {
      return await this.prisma.product.findUnique({
        where: { id: BigInt(id) },
        include: {
          category: true,
          variants: true,
          images: true
        }
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Tạo sản phẩm mới cùng với variants và images
   * @param data - Dữ liệu sản phẩm bao gồm variants và images
   * @returns Sản phẩm vừa tạo
   */
  async createProduct(data: any) {
    try {
      const { variants, images, ...productData } = data;

      return await this.prisma.product.create({
        data: {
          ...productData,
          variants: {
            create: variants || []
          },
          images: {
            create: images || []
          }
        },
        include: {
          category: true,
          variants: true,
          images: true
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Cập nhật sản phẩm và các variants, images liên quan
   * Xóa và tạo lại variants/images để đảm bảo tính nhất quán
   * @param id - ID của sản phẩm cần cập nhật
   * @param data - Dữ liệu mới
   * @returns Sản phẩm đã cập nhật
   */
  async updateProduct(id: number, data: any) {
    try {
      const { variants, images, ...productData } = data;

      // Update product
      const product = await this.prisma.product.update({
        where: { id: BigInt(id) },
        data: productData,
        include: {
          category: true,
          variants: true,
          images: true
        }
      });

      // Update variants if provided
      if (variants) {
        await this.prisma.productVariant.deleteMany({
          where: { productId: BigInt(id) }
        });
        if (variants.length > 0) {
          await this.prisma.productVariant.createMany({
            data: variants.map((variant: any) => ({
              ...variant,
              productId: BigInt(id)
            }))
          });
        }
      }

      // Update images if provided
      if (images) {
        await this.prisma.productImage.deleteMany({
          where: { productId: BigInt(id) }
        });
        if (images.length > 0) {
          await this.prisma.productImage.createMany({
            data: images.map((image: any) => ({
              ...image,
              productId: BigInt(id)
            }))
          });
        }
      }

      return this.getProduct(id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Xóa sản phẩm và tất cả variants, images liên quan
   * @param id - ID của sản phẩm cần xóa
   * @returns Sản phẩm đã xóa
   */
  async deleteProduct(id: number) {
    try {
      // Delete related records first
      await this.prisma.productVariant.deleteMany({
        where: { productId: BigInt(id) }
      });

      await this.prisma.productImage.deleteMany({
        where: { productId: BigInt(id) }
      });

      // Delete product
      return await this.prisma.product.delete({
        where: { id: BigInt(id) }
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getOrders(params: any) {
    return { orders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
  }

  async updateOrderStatus(id: number, status: string) {
    return { id, status };
  }

  async getUsers(params: any) {
    return { users: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
  }

  /**
   * Lấy danh sách tất cả danh mục
   * @returns Danh sách danh mục đã sắp xếp theo position
   */
  async getCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        orderBy: { position: 'asc' }
      });
      
      // Convert BigInt to string
      return categories.map(category => ({
        ...category,
        id: category.id.toString(),
        parentId: category.parentId?.toString() || null
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Lấy thông tin chi tiết một danh mục
   * @param id - ID của danh mục
   * @returns Thông tin danh mục với parent, children và số sản phẩm
   */
  async getCategory(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: BigInt(id) },
        include: {
          parent: true,
          children: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return {
        ...category,
        id: category.id.toString(),
        parentId: category.parentId?.toString() || null,
        parent: category.parent ? {
          ...category.parent,
          id: category.parent.id.toString()
        } : null,
        children: category.children.map(child => ({
          ...child,
          id: child.id.toString(),
          parentId: child.parentId?.toString() || null
        }))
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Tạo danh mục mới với slug tự động
   * @param data - Dữ liệu danh mục
   * @returns Danh mục vừa tạo
   */
  async createCategory(data: any) {
    try {
      const { parentId, ...categoryData } = data;
      
      const category = await this.prisma.category.create({
        data: {
          ...categoryData,
          parentId: parentId ? BigInt(parentId) : null,
          slug: this.generateSlug(categoryData.name)
        },
        include: {
          parent: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      return {
        ...category,
        id: category.id.toString(),
        parentId: category.parentId?.toString() || null,
        parent: category.parent ? {
          ...category.parent,
          id: category.parent.id.toString()
        } : null
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Cập nhật danh mục với slug tự động
   * @param id - ID của danh mục cần cập nhật
   * @param data - Dữ liệu mới
   * @returns Danh mục đã cập nhật
   */
  async updateCategory(id: number, data: any) {
    try {
      const { parentId, ...categoryData } = data;
      
      const category = await this.prisma.category.update({
        where: { id: BigInt(id) },
        data: {
          ...categoryData,
          parentId: parentId ? BigInt(parentId) : null,
          slug: categoryData.name ? this.generateSlug(categoryData.name) : undefined
        },
        include: {
          parent: true,
          _count: {
            select: {
              products: true
            }
          }
        }
      });

      return {
        ...category,
        id: category.id.toString(),
        parentId: category.parentId?.toString() || null,
        parent: category.parent ? {
          ...category.parent,
          id: category.parent.id.toString()
        } : null
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Xóa danh mục với kiểm tra ràng buộc
   * Không cho phép xóa danh mục có sản phẩm hoặc danh mục con
   * @param id - ID của danh mục cần xóa
   * @returns Danh mục đã xóa
   */
  async deleteCategory(id: number) {
    try {
      // Check if category has products
      const productCount = await this.prisma.product.count({
        where: { categoryId: BigInt(id) }
      });

      if (productCount > 0) {
        throw new Error('Không thể xóa danh mục có sản phẩm');
      }

      // Check if category has children
      const childrenCount = await this.prisma.category.count({
        where: { parentId: BigInt(id) }
      });

      if (childrenCount > 0) {
        throw new Error('Không thể xóa danh mục có danh mục con');
      }

      return await this.prisma.category.delete({
        where: { id: BigInt(id) }
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Tạo slug từ tên danh mục
   * Chuyển đổi tên thành URL-friendly format
   * @param name - Tên danh mục
   * @returns Slug đã được tạo
   */
  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
}
