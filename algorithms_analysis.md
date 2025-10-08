# Phân Tích Thuật Toán Trong Dự Án E-commerce Nông Sản

## **Tổng Quan Dự Án**
- **Backend**: NestJS + Prisma + MySQL
- **Frontend**: ReactJS + TypeScript
- **Payment**: VNPay Integration
- **Database**: MySQL với Prisma ORM

---

## **1. THUẬT TOÁN BẢO MẬT VNPAY**

### **HMAC-SHA512 Hash Algorithm**
```typescript
// File: be_nestjs/src/payment/vnpay.service.ts
createPaymentUrl(orderId: string, amount: number, orderInfo: string, ipAddr: string): string {
  // 1. Tạo parameters
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: amount * 100, // Chuyển đổi sang cents
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };
  
  // 2. Sắp xếp parameters theo alphabet
  const sortedParams = this.sortObject(vnp_Params);
  
  // 3. Tạo query string
  const queryString = querystring.stringify(sortedParams);
  
  // 4. Tạo HMAC-SHA512 hash
  const secureHash = crypto
    .createHmac('sha512', config.hashSecret)
    .update(queryString)
    .digest('hex');
    
  return `${config.vnpayUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
}
```

### **Sorting Algorithm cho Parameters**
```typescript
private sortObject(obj: any): any {
  const sorted: any = {};
  const keys = Object.keys(obj).sort(); // Alphabetical sort
  
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  
  return sorted;
}
```

### **Checksum Verification Algorithm**
```typescript
verifyReturnUrl(vnp_Params: any): { isValid: boolean; orderId?: string; amount?: number } {
  const secureHash = vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = this.sortObject(vnp_Params);
  const queryString = querystring.stringify(sortedParams);
  
  const checkSum = crypto
    .createHmac('sha512', config.hashSecret)
    .update(queryString)
    .digest('hex');

  const isValid = secureHash === checkSum;
  
  return { isValid, orderId: vnp_Params['vnp_TxnRef'], amount: parseInt(vnp_Params['vnp_Amount']) / 100 };
}
```

---

## **2. THUẬT TOÁN QUẢN LÝ TỒN KHO**

### **Atomic Stock Management**
```typescript
// File: be_nestjs/src/payment/payment.service.ts
async processPayment(userId: number, dto: ProcessPaymentDto) {
  // 1. Kiểm tra tồn kho trước khi thanh toán
  for (const item of cart.items) {
    if (item.variantId && item.variant) {
      if (item.variant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${item.product.name} chỉ còn ${item.variant.stockQuantity} sản phẩm`
        );
      }
    }
  }

  // 2. Database Transaction đảm bảo tính nhất quán
  return await this.prisma.$transaction(async (tx) => {
    // Tạo đơn hàng
    const order = await tx.order.create({
      data: {
        orderCode: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: BigInt(userId),
        status: 'PENDING',
        paymentMethod: paymentMethod,
        notes,
        totalAmount: totalAmount
      }
    });

    // 3. Trừ số lượng kho ATOMICALLY
    for (const item of cart.items) {
      if (item.variantId && item.variant) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: {
              decrement: item.quantity // Atomic decrement
            }
          }
        });
      }
    }

    // 4. Xóa giỏ hàng sau khi thành công
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  });
}
```

### **Stock Validation Algorithm**
```typescript
// File: be_nestjs/src/cart/cart.service.ts
async addToCart(userId: number, dto: AddToCartDto) {
  // LƯU Ý: Chỉ kiểm tra sản phẩm tồn tại, KHÔNG trừ số lượng kho
  // Số lượng kho chỉ được trừ khi thanh toán thành công
  
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new NotFoundException('Sản phẩm không tồn tại');
  }

  // Kiểm tra variant và tồn kho
  if (variantId) {
    const selectedVariant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    
    if (!selectedVariant) {
      throw new BadRequestException('Biến thể sản phẩm không tồn tại');
    }
  }
}
```

---

## **3. THUẬT TOÁN TÌM KIẾM & LỌC SẢN PHẨM**

### **Multi-Criteria Search Algorithm**
```typescript
// File: be_nestjs/src/products/products.service.ts
async list(params: {
  page?: string;
  limit?: string;
  categorySlug?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  // 1. Pagination validation
  const page = Math.max(parseInt(params.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(params.limit || '12', 10), 1), 100);

  // 2. Dynamic where clause building
  const where: any = { isActive: true };
  
  // Category filtering
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  }
  
  // Full-text search (case-insensitive)
  if (params.search) {
    where.name = { contains: params.search, mode: 'insensitive' };
  }
  
  // Price range filtering với nested query
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

  // 3. Database query với optimization
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

  // 4. Data transformation và type safety
  const data = products.map((p) => ({
    ...p,
    id: Number(p.id),
    categoryId: p.categoryId ? Number(p.categoryId) : null,
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
```

### **Pagination Algorithm**
```typescript
// Smart pagination với boundary checking
const pagination = {
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
};
```

---

## **4. THUẬT TOÁN TÍNH TOÁN ĐÁNH GIÁ**

### **Rating Calculation Algorithm**
```typescript
// File: be_nestjs/src/products/products.service.ts
async detail(id: number) {
  const product = await this.prisma.product.findFirst({
    where: { id: BigInt(id), isActive: true },
    include: {
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Thuật toán tính điểm trung bình
  const avgRating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;

  return {
    success: true,
    data: {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10, // Làm tròn đến 1 chữ số thập phân
      reviewCount: product.reviews.length,
    }
  };
}
```

### **Featured Products Algorithm**
```typescript
async getFeaturedProducts(limit: number = 25) {
  const products = await this.prisma.product.findMany({
    where: { isActive: true },
    include: {
      reviews: {
        where: { isApproved: true },
        select: { rating: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  const data = products.map((p) => {
    // Tính rating cho từng sản phẩm
    const avgRating = p.reviews.length
      ? p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length
      : 0;

    return {
      ...p,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: p.reviews.length,
    };
  });

  return { success: true, data: { products: data, total: data.length } };
}
```

---

## **5. THUẬT TOÁN QUẢN LÝ GIỎ HÀNG**

### **Cart Synchronization Algorithm**
```typescript
// File: be_nestjs/src/cart/cart.service.ts
async getCart(userId: number) {
  // Tìm hoặc tạo giỏ hàng cho user
  let cart = await this.prisma.cart.findFirst({
    where: { userId: BigInt(userId) },
  });

  if (!cart) {
    cart = await this.prisma.cart.create({
      data: { userId: BigInt(userId) },
    });
  }

  // Load cart items với product details
  const cartItems = await this.prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: { where: { isActive: true } },
        },
      },
      variant: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    data: {
      cart: { id: Number(cart.id), userId: Number(cart.userId) },
      items: cartItems.map(item => ({
        ...item,
        id: Number(item.id),
        productId: Number(item.productId),
        variantId: item.variantId ? Number(item.variantId) : null,
        unitPriceSnapshot: Number(item.unitPriceSnapshot),
        product: {
          ...item.product,
          id: Number(item.product.id),
          categoryId: item.product.categoryId ? Number(item.product.categoryId) : null,
          variants: item.product.variants.map(v => ({
            ...v,
            id: Number(v.id),
            productId: Number(v.productId),
            price: Number(v.price),
            compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          })),
        },
        variant: item.variant ? {
          ...item.variant,
          id: Number(item.variant.id),
          productId: Number(item.variant.productId),
          price: Number(item.variant.price),
          compareAtPrice: item.variant.compareAtPrice ? Number(item.variant.compareAtPrice) : null,
        } : null,
      })),
    }
  };
}
```

### **Add to Cart Algorithm**
```typescript
async addToCart(userId: number, dto: AddToCartDto) {
  const { productId, variantId, quantity } = dto;

  // 1. Validate product exists
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product) {
    throw new NotFoundException('Sản phẩm không tồn tại');
  }

  // 2. Validate variant if provided
  let selectedVariant = null;
  if (variantId) {
    selectedVariant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!selectedVariant) {
      throw new BadRequestException('Biến thể sản phẩm không tồn tại');
    }
  }

  // 3. Find or create cart
  let cart = await this.prisma.cart.findFirst({
    where: { userId: BigInt(userId) },
  });

  if (!cart) {
    cart = await this.prisma.cart.create({
      data: { userId: BigInt(userId) },
    });
  }

  // 4. Check existing item
  const existingItem = await this.prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    // Update quantity
    await this.prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Create new item
    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        unitPriceSnapshot: selectedVariant ? Number(selectedVariant.price) : 0,
      },
    });
  }

  return { success: true, message: 'Đã thêm vào giỏ hàng' };
}
```

---

## **6. THUẬT TOÁN WISHLIST**

### **Wishlist Management Algorithm**
```typescript
// File: be_nestjs/src/wishlist/wishlist.service.ts
async getWishlist(userId: number) {
  // Find or create wishlist for user
  let wishlist = await this.prisma.wishlist.findUnique({
    where: { userId: BigInt(userId) },
  });

  if (!wishlist) {
    wishlist = await this.prisma.wishlist.create({
      data: { userId: BigInt(userId) },
    });
  }

  const wishlistItems = await this.prisma.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { position: 'asc' }, take: 1 },
          variants: { take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    success: true,
    data: wishlistItems.map(item => ({
      id: Number(item.id),
      productId: Number(item.productId),
      userId: Number(userId),
      createdAt: item.createdAt,
      product: {
        id: Number(item.product.id),
        name: item.product.name,
        description: item.product.description,
        category: item.product.category ? {
          id: Number(item.product.category.id),
          name: item.product.category.name,
        } : null,
        images: item.product.images.map(img => ({
          imageUrl: img.imageUrl,
        })),
        variants: item.product.variants.map(variant => ({
          id: Number(variant.id),
          variantName: variant.variantName,
          price: Number(variant.price),
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        })),
        avgRating: 0,
        reviewCount: 0,
      },
    })),
  };
}
```

---

## **7. THUẬT TOÁN TẠO MÃ ĐỊNH DANH**

### **Unique Order Code Generation**
```typescript
// Thuật toán tạo mã đơn hàng duy nhất
const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Format: ORD-1703123456789-abc123def
// - ORD: Prefix
// - Date.now(): Timestamp (milliseconds)
// - Math.random().toString(36).substr(2, 9): Random string (9 chars)
```

### **Date Formatting Algorithm**
```typescript
private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
  // Format: 20231225143022 (YYYYMMDDHHMMSS)
}
```

---

## **8. THUẬT TOÁN TỐI ƯU PERFORMANCE**

### **Database Indexing Strategy**
```sql
-- Prisma Schema optimizations
@@index([categoryId])           -- Product category index
@@index([userId])              -- User-based queries
@@index([sessionId])           -- Session-based cart
@@index([productId])           -- Product relations
@@index([cartId])              -- Cart items
@@index([orderId])             -- Order items
@@unique([userId])             -- Unique constraints
@@unique([slug])               -- Unique slugs
```

### **Query Optimization**
```typescript
// Efficient pagination
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
```

---

## **9. THUẬT TOÁN XỬ LÝ LỖI**

### **Error Handling Strategy**
```typescript
// Comprehensive error handling
try {
  // Business logic
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Database errors
    throw new BadRequestException('Lỗi cơ sở dữ liệu');
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Validation errors
    throw new BadRequestException('Dữ liệu không hợp lệ');
  } else {
    // Generic errors
    throw new InternalServerErrorException('Lỗi hệ thống');
  }
}
```

---

## **10. THUẬT TOÁN FRONTEND OPTIMIZATION**

### **React Query Caching**
```typescript
// File: fe_reactjs/src/pages/Products.tsx
const { data: productsResp, isLoading } = useQuery([
  'products', selectedCategory, searchTerm, currentPage
], () => productApi.getProducts({
  page: currentPage,
  limit: 12,
  category: selectedCategory || undefined,
  search: searchTerm || undefined,
}).then(r => r.data), {
  keepPreviousData: true, // Smooth pagination
});
```

### **State Management Algorithm**
```typescript
// Context-based state management
const { addToCart } = useCart();
const { addToWishlist } = useWishlist();

// Optimistic updates
const handleAddToCart = async (productId: number, variantId?: number) => {
  setAddingToCart(productId);
  try {
    await addToCart(productId, variantId, 1);
    toast.success('Đã thêm vào giỏ hàng');
  } catch (error) {
    toast.error('Có lỗi xảy ra');
  } finally {
    setAddingToCart(null);
  }
};
```

---

## **KẾT LUẬN**

Dự án này sử dụng nhiều **thuật toán thực tế** trong e-commerce:

1. **Security**: HMAC-SHA512, Checksum verification
2. **Inventory**: Atomic stock management, Transaction-based operations
3. **Search**: Multi-criteria filtering, Full-text search
4. **Rating**: Statistical calculation, Review aggregation
5. **Cart**: Session management, State synchronization
6. **Wishlist**: User preference tracking
7. **ID Generation**: Unique identifier algorithms
8. **Performance**: Database indexing, Query optimization
9. **Error Handling**: Comprehensive error management
10. **Frontend**: React optimization, State management

**Độ phức tạp**: O(n) đến O(log n) cho hầu hết operations
**Scalability**: Tốt với database indexing và caching
**Security**: Cao với cryptographic algorithms
**User Experience**: Tối ưu với optimistic updates

Đây là một dự án **production-ready** với kiến trúc tốt!