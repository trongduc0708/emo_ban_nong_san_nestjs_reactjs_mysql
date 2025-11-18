import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Tổng số đơn hàng
      const totalOrders = await this.prisma.order.count();
      const ordersThisMonth = await this.prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth }
        }
      });
      const ordersLastMonth = await this.prisma.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });

      // Tổng doanh thu
      const revenueResult = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      });
      const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

      const revenueThisMonth = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: startOfMonth }
        }
      });
      const revenueLastMonth = await this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });
      const revenueThisMonthNum = Number(revenueThisMonth._sum.totalAmount || 0);
      const revenueLastMonthNum = Number(revenueLastMonth._sum.totalAmount || 0);

      // Tổng số khách hàng
      const totalUsers = await this.prisma.user.count({
        where: { role: 'customer' }
      });
      const usersThisMonth = await this.prisma.user.count({
        where: {
          role: 'customer',
          createdAt: { gte: startOfMonth }
        }
      });
      const usersLastMonth = await this.prisma.user.count({
        where: {
          role: 'customer',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        }
      });

      // Đơn hàng gần đây
      const recentOrders = await this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Sản phẩm bán chạy (top 3)
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
      });

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              images: {
                take: 1,
                select: { imageUrl: true }
              }
            }
          });
          return {
            id: product?.id.toString(),
            name: product?.name || 'Unknown',
            orderCount: item._count.id,
            imageUrl: product?.images[0]?.imageUrl || null
          };
        })
      );

      // Tính % thay đổi
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const ordersChange = calculateChange(ordersThisMonth, ordersLastMonth);
      const revenueChange = calculateChange(revenueThisMonthNum, revenueLastMonthNum);
      const usersChange = calculateChange(usersThisMonth, usersLastMonth);

      // Tính tăng trưởng tổng thể (trung bình của các chỉ số)
      const growthRate = Math.round((ordersChange + revenueChange + usersChange) / 3);

      // Format recent orders
      const formattedRecentOrders = recentOrders.map(order => ({
        id: Number(order.id),
        customer: order.user?.fullName || 'Khách hàng',
        total: Number(order.totalAmount),
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      }));

      return {
        stats: {
          totalOrders: {
            value: totalOrders.toLocaleString('vi-VN'),
            change: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`,
            changeType: ordersChange >= 0 ? 'positive' : 'negative'
          },
          totalRevenue: {
            value: `${(totalRevenue / 1000000).toFixed(1)}M₫`,
            change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
            changeType: revenueChange >= 0 ? 'positive' : 'negative'
          },
          totalUsers: {
            value: totalUsers.toLocaleString('vi-VN'),
            change: `${usersChange >= 0 ? '+' : ''}${usersChange}%`,
            changeType: usersChange >= 0 ? 'positive' : 'negative'
          },
          growth: {
            value: `${growthRate}%`,
            change: `${growthRate >= 0 ? '+' : ''}${growthRate}%`,
            changeType: growthRate >= 0 ? 'positive' : 'negative'
          }
        },
        recentOrders: formattedRecentOrders,
        topProducts: topProductsWithDetails
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
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

  /**
   * Lấy danh sách users với phân trang, tìm kiếm và lọc
   * @param params - Tham số: page, limit, search, role
   * @returns Danh sách users với thông tin phân trang
   */
  async getUsers(params: any) {
    const { page = 1, limit = 10, search, role } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }
    if (role && role !== 'all') {
      where.role = role;
    }

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            _count: {
              select: {
                orders: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.user.count({ where })
      ]);

      // Tính tổng chi tiêu của mỗi user
      const usersWithStats = await Promise.all(
        users.map(async (user) => {
          const orderStats = await this.prisma.order.aggregate({
            where: {
              userId: user.id,
              status: { not: 'CANCELLED' }
            },
            _sum: {
              totalAmount: true
            }
          });

          return {
            ...user,
            id: user.id.toString(),
            ordersCount: user._count.orders,
            totalSpent: Number(orderStats._sum.totalAmount || 0)
          };
        })
      );

      return {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết một user
   * @param id - ID của user
   * @returns Thông tin user
   */
  async getUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(id) },
        include: {
          _count: {
            select: {
              orders: true
            }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const orderStats = await this.prisma.order.aggregate({
        where: {
          userId: user.id,
          status: { not: 'CANCELLED' }
        },
        _sum: {
          totalAmount: true
        }
      });

      return {
        ...user,
        id: user.id.toString(),
        ordersCount: user._count.orders,
        totalSpent: Number(orderStats._sum.totalAmount || 0)
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin user
   * @param id - ID của user
   * @param data - Dữ liệu cập nhật
   * @returns User đã cập nhật
   */
  async updateUser(id: number, data: any) {
    try {
      const user = await this.prisma.user.update({
        where: { id: BigInt(id) },
        data: {
          ...data,
          // Đảm bảo role là một trong các giá trị hợp lệ
          role: data.role && ['customer', 'admin', 'seller'].includes(data.role) ? data.role : undefined
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        ...user,
        id: user.id.toString()
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
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
   * Lấy danh sách reviews với phân trang, tìm kiếm và lọc
   * @param params - Tham số: page, limit, search, productId, userId, isApproved, rating
   * @returns Danh sách reviews với thông tin phân trang
   */
  async getReviews(params: any) {
    const { page = 1, limit = 10, search, productId, userId, isApproved, rating } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { product: { name: { contains: search } } },
        { user: { fullName: { contains: search } } }
      ];
    }
    if (productId) {
      where.productId = BigInt(productId);
    }
    if (userId) {
      where.userId = BigInt(userId);
    }
    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true' || isApproved === true;
    }
    if (rating) {
      where.rating = parseInt(rating);
    }

    try {
      const [reviews, total] = await Promise.all([
        this.prisma.review.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true
              }
            },
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  take: 1,
                  select: { imageUrl: true }
                }
              }
            },
            order: {
              select: {
                id: true,
                orderCode: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.review.count({ where })
      ]);

      const processedReviews = reviews.map(review => ({
        ...review,
        id: review.id.toString(),
        userId: review.userId.toString(),
        productId: review.productId.toString(),
        orderId: review.orderId?.toString() || null,
        rating: Number(review.rating),
        imagesJson: review.imagesJson ? (typeof review.imagesJson === 'string' ? JSON.parse(review.imagesJson) : review.imagesJson) : null,
        user: {
          ...review.user,
          id: review.user.id.toString()
        },
        product: {
          ...review.product,
          id: review.product.id.toString()
        },
        order: review.order ? {
          ...review.order,
          id: review.order.id.toString()
        } : null
      }));

      return {
        reviews: processedReviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chi tiết một review
   * @param id - ID của review
   * @returns Thông tin review
   */
  async getReview(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id: BigInt(id) },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                take: 1,
                select: { imageUrl: true }
              }
            }
          },
          order: {
            select: {
              id: true,
              orderCode: true
            }
          }
        }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      return {
        ...review,
        id: review.id.toString(),
        userId: review.userId.toString(),
        productId: review.productId.toString(),
        orderId: review.orderId?.toString() || null,
        rating: Number(review.rating),
        imagesJson: review.imagesJson ? (typeof review.imagesJson === 'string' ? JSON.parse(review.imagesJson) : review.imagesJson) : null,
        user: {
          ...review.user,
          id: review.user.id.toString()
        },
        product: {
          ...review.product,
          id: review.product.id.toString()
        },
        order: review.order ? {
          ...review.order,
          id: review.order.id.toString()
        } : null
      };
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  }

  /**
   * Phê duyệt review
   * @param id - ID của review
   * @returns Review đã được phê duyệt
   */
  async approveReview(id: number) {
    try {
      const review = await this.prisma.review.update({
        where: { id: BigInt(id) },
        data: { isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        ...review,
        id: review.id.toString(),
        userId: review.userId.toString(),
        productId: review.productId.toString(),
        orderId: review.orderId?.toString() || null,
        rating: Number(review.rating)
      };
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  }

  /**
   * Từ chối/hủy phê duyệt review
   * @param id - ID của review
   * @returns Review đã bị từ chối
   */
  async rejectReview(id: number) {
    try {
      const review = await this.prisma.review.update({
        where: { id: BigInt(id) },
        data: { isApproved: false },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          product: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return {
        ...review,
        id: review.id.toString(),
        userId: review.userId.toString(),
        productId: review.productId.toString(),
        orderId: review.orderId?.toString() || null,
        rating: Number(review.rating)
      };
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }

  /**
   * Xóa review
   * @param id - ID của review
   * @returns Review đã xóa
   */
  async deleteReview(id: number) {
    try {
      return await this.prisma.review.delete({
        where: { id: BigInt(id) }
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả settings
   * @returns Danh sách settings
   */
  async getSettings() {
    try {
      const settings = await this.prisma.setting.findMany({
        orderBy: { key: 'asc' }
      });

      return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  /**
   * Cập nhật setting
   * @param key - Key của setting
   * @param value - Giá trị mới
   * @returns Setting đã cập nhật
   */
  async updateSetting(key: string, value: string) {
    try {
      return await this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo chi tiết với nhiều thống kê
   * @param params - Tham số: startDate, endDate, period (day/week/month)
   * @returns Báo cáo chi tiết
   */
  async getReports(params: any) {
    try {
      const { startDate, endDate, period = 'month' } = params;
      const now = new Date();
      let start: Date, end: Date = now;

      // Tính toán khoảng thời gian
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        // Mặc định là 30 ngày gần nhất
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      }

      // Đảm bảo end >= start
      if (end < start) {
        [start, end] = [end, start];
      }

      // 1. Thống kê đơn hàng theo trạng thái
      const ordersByStatus = await this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: start, lte: end }
        }
      });

      // 2. Doanh thu theo ngày/tuần/tháng
      const revenueByPeriod = await this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: start, lte: end }
        },
        select: {
          totalAmount: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      // 3. Top 10 sản phẩm bán chạy
      // Lấy danh sách order IDs hợp lệ trước để tránh lỗi ambiguous column
      const validOrderIds = await this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: start, lte: end }
        },
        select: { id: true }
      });

      const topProducts = validOrderIds.length > 0 ? await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { id: true },
        _sum: { quantity: true, totalPrice: true },
        where: {
          orderId: { in: validOrderIds.map(o => o.id) }
        },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }) : [];

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              images: { take: 1, select: { imageUrl: true } }
            }
          });
          return {
            id: product?.id.toString(),
            name: product?.name || 'Unknown',
            quantity: Number(item._sum?.quantity || 0),
            revenue: Number(item._sum?.totalPrice || 0),
            orderCount: item._count?.id || 0,
            imageUrl: product?.images[0]?.imageUrl || null
          };
        })
      );

      // 4. Top 10 khách hàng mua nhiều nhất
      const topCustomers = await this.prisma.order.groupBy({
        by: ['userId'],
        _count: { id: true },
        _sum: { totalAmount: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: { gte: start, lte: end }
        },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 10
      });

      const topCustomersWithDetails = await Promise.all(
        topCustomers.map(async (item) => {
          if (!item.userId) return null;
          const user = await this.prisma.user.findUnique({
            where: { id: item.userId },
            select: { id: true, fullName: true, email: true, avatarUrl: true }
          });
          return {
            id: user?.id.toString(),
            name: user?.fullName || 'Unknown',
            email: user?.email || '',
            avatarUrl: user?.avatarUrl || null,
            orderCount: item._count?.id || 0,
            totalSpent: Number(item._sum?.totalAmount || 0)
          };
        })
      ).then(results => results.filter((r): r is NonNullable<typeof r> => r !== null));

      // 5. Thống kê theo danh mục
      // Sử dụng lại validOrderIds đã lấy ở trên
      const salesByCategory = validOrderIds.length > 0 ? await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { id: true },
        _sum: { totalPrice: true, quantity: true },
        where: {
          orderId: { in: validOrderIds.map(o => o.id) }
        }
      }) : [];

      const categoryStats = new Map<string, { count: number; revenue: number; quantity: number }>();
      
      for (const item of salesByCategory) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { categoryId: true, category: { select: { name: true } } }
        });

        if (product?.categoryId) {
          const catName = product.category?.name || 'Không phân loại';
          const existing = categoryStats.get(catName) || { count: 0, revenue: 0, quantity: 0 };
          categoryStats.set(catName, {
            count: existing.count + (item._count?.id || 0),
            revenue: existing.revenue + Number(item._sum?.totalPrice || 0),
            quantity: existing.quantity + Number(item._sum?.quantity || 0)
          });
        }
      }

      // 6. Doanh thu theo ngày (để vẽ biểu đồ)
      const revenueByDay: Record<string, number> = {};
      revenueByPeriod.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        revenueByDay[date] = (revenueByDay[date] || 0) + Number(order.totalAmount);
      });

      // 7. Tổng hợp
      const totalRevenue = ordersByStatus.reduce((sum, item) => sum + Number(item._sum.totalAmount || 0), 0);
      const totalOrders = ordersByStatus.reduce((sum, item) => sum + item._count.id, 0);
      const completedOrders = ordersByStatus.find(item => item.status === 'COMPLETED')?._count.id || 0;

      return {
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        },
        summary: {
          totalRevenue,
          totalOrders,
          completedOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.id,
          revenue: Number(item._sum.totalAmount || 0)
        })),
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({
          date,
          revenue
        })),
        topProducts: topProductsWithDetails,
        topCustomers: topCustomersWithDetails,
        salesByCategory: Array.from(categoryStats.entries()).map(([name, stats]) => ({
          category: name,
          orderCount: stats.count,
          revenue: stats.revenue,
          quantity: stats.quantity
        }))
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Lấy báo cáo tồn kho
   * @param params - Tham số: lowStockThreshold (mặc định 50)
   * @returns Báo cáo tồn kho chi tiết
   */
  async getInventoryReport(params: any) {
    try {
      const lowStockThreshold = params.lowStockThreshold ? parseInt(params.lowStockThreshold) : 50;

      // 1. Lấy tất cả variants với thông tin sản phẩm
      const variants = await this.prisma.productVariant.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              },
              images: {
                take: 1,
                select: { imageUrl: true }
              }
            }
          }
        },
        orderBy: { stockQuantity: 'asc' }
      });

      // 2. Tính toán thống kê
      const totalVariants = variants.length;
      const inStock = variants.filter(v => v.stockQuantity > 0).length;
      const outOfStock = variants.filter(v => v.stockQuantity === 0).length;
      const lowStock = variants.filter(v => v.stockQuantity > 0 && v.stockQuantity <= lowStockThreshold).length;
      const totalQuantity = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

      // 3. Tính tổng giá trị tồn kho (số lượng * giá)
      const totalInventoryValue = variants.reduce((sum, v) => {
        return sum + (v.stockQuantity * Number(v.price));
      }, 0);

      // 4. Sản phẩm hết hàng
      const outOfStockVariants = variants
        .filter(v => v.stockQuantity === 0)
        .map(v => ({
          id: v.id.toString(),
          productId: v.productId.toString(),
          productName: v.product.name,
          variantName: v.variantName,
          unitLabel: v.unitLabel || '',
          price: Number(v.price),
          stockQuantity: v.stockQuantity,
          isActive: v.isActive,
          categoryName: v.product.category?.name || 'Không phân loại',
          imageUrl: v.product.images[0]?.imageUrl || null
        }));

      // 5. Sản phẩm sắp hết hàng
      const lowStockVariants = variants
        .filter(v => v.stockQuantity > 0 && v.stockQuantity <= lowStockThreshold)
        .map(v => ({
          id: v.id.toString(),
          productId: v.productId.toString(),
          productName: v.product.name,
          variantName: v.variantName,
          unitLabel: v.unitLabel || '',
          price: Number(v.price),
          stockQuantity: v.stockQuantity,
          isActive: v.isActive,
          categoryName: v.product.category?.name || 'Không phân loại',
          imageUrl: v.product.images[0]?.imageUrl || null
        }));

      // 6. Top sản phẩm tồn kho nhiều nhất
      const topStockVariants = variants
        .filter(v => v.stockQuantity > 0)
        .sort((a, b) => b.stockQuantity - a.stockQuantity)
        .slice(0, 10)
        .map(v => ({
          id: v.id.toString(),
          productId: v.productId.toString(),
          productName: v.product.name,
          variantName: v.variantName,
          unitLabel: v.unitLabel || '',
          price: Number(v.price),
          stockQuantity: v.stockQuantity,
          inventoryValue: v.stockQuantity * Number(v.price),
          categoryName: v.product.category?.name || 'Không phân loại',
          imageUrl: v.product.images[0]?.imageUrl || null
        }));

      // 7. Tổng giá trị tồn kho theo danh mục
      const inventoryByCategory = new Map<string, { quantity: number; value: number; variantCount: number }>();
      
      variants.forEach(v => {
        const catName = v.product.category?.name || 'Không phân loại';
        const existing = inventoryByCategory.get(catName) || { quantity: 0, value: 0, variantCount: 0 };
        inventoryByCategory.set(catName, {
          quantity: existing.quantity + v.stockQuantity,
          value: existing.value + (v.stockQuantity * Number(v.price)),
          variantCount: existing.variantCount + 1
        });
      });

      return {
        summary: {
          totalVariants,
          inStock,
          outOfStock,
          lowStock,
          totalQuantity,
          totalInventoryValue,
          lowStockThreshold
        },
        outOfStockVariants,
        lowStockVariants,
        topStockVariants,
        inventoryByCategory: Array.from(inventoryByCategory.entries())
          .sort((a, b) => b[1].value - a[1].value)
          .map(([category, stats]) => ({
            category,
            quantity: stats.quantity,
            value: stats.value,
            variantCount: stats.variantCount
          }))
      };
    } catch (error) {
      console.error('Error fetching inventory report:', error);
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
