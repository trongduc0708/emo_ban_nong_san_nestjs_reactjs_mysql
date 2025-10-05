# Emo Nông Sản - Website Bán Nông Sản Địa Phương

Dự án website bán nông sản địa phương với tích hợp VNPAY thanh toán.

## Cấu trúc dự án

```
emo_ban_nong_san_nestjs_reactjs_mysql/
├── be_nextjs/          # Backend Next.js API
├── fe_reactjs/          # Frontend React.js
├── schema_emo_nongsan.sql  # Database schema
└── README.md
```

## Công nghệ sử dụng

### Backend (Next.js)
- **Framework**: Next.js 14 với App Router
- **Database**: MySQL với Prisma ORM
- **Authentication**: JWT
- **Payment**: VNPAY integration
- **Language**: TypeScript

### Frontend (React.js)
- **Framework**: React 18 với Vite
- **Routing**: React Router DOM
- **State Management**: React Query + Context API
- **UI**: Tailwind CSS
- **Language**: TypeScript

### Database
- **MySQL** với schema đầy đủ cho e-commerce
- **Prisma ORM** cho type-safe database operations

## Hướng dẫn setup

### 1. Cài đặt Backend

```bash
cd be_nextjs
npm install
```

### 2. Cài đặt Frontend

```bash
cd fe_reactjs
npm install
```

### 3. Setup Database

1. Tạo database MySQL:
```sql
CREATE DATABASE emo_nongsan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Import schema và dữ liệu mẫu:
```bash
mysql -u root -p emo_nongsan < schema_emo_nongsan.sql
```

**Lưu ý**: File `schema_emo_nongsan.sql` đã bao gồm cả:
- Schema database đầy đủ
- Dữ liệu mẫu (5 danh mục, 25 sản phẩm, hình ảnh, variants, reviews)
- Tài khoản admin mẫu: `admin@emonongsan.com` / `password123`
- Tài khoản khách hàng mẫu: `customer@example.com` / `password123`

3. Setup Prisma:
```bash
cd be_nextjs
npx prisma generate
npx prisma db push
```

### 4. Cấu hình Environment Variables

#### Backend (.env.local)
```env
DATABASE_URL="mysql://root:password@localhost:3306/emo_nongsan"
JWT_SECRET="your-super-secret-jwt-key-here"
VNPAY_TMN_CODE="your-tmn-code"
VNPAY_HASH_SECRET="your-hash-secret"
VNPAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
VNPAY_RETURN_URL="http://localhost:3000/api/payment/vnpay-return"
VNPAY_IPN_URL="http://localhost:3000/api/payment/vnpay-ipn"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000/api"
```

### 5. Chạy dự án

#### Backend (Port 3000)
```bash
cd be_nextjs
npm run dev
```

#### Frontend (Port 3001)
```bash
cd fe_reactjs
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/[id]` - Chi tiết sản phẩm
- `GET /api/categories` - Danh mục sản phẩm

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ hàng
- `PUT /api/cart/items/[id]` - Cập nhật giỏ hàng
- `DELETE /api/cart/items/[id]` - Xóa khỏi giỏ hàng

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/[id]` - Chi tiết đơn hàng

### Payment
- `POST /api/payment/vnpay` - Tạo thanh toán VNPAY
- `GET /api/payment/vnpay-return` - Callback từ VNPAY
- `POST /api/payment/vnpay-ipn` - IPN từ VNPAY

## Tính năng chính

### Cho khách hàng
- ✅ Đăng ký/Đăng nhập
- ✅ Duyệt sản phẩm theo danh mục
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Giỏ hàng và yêu thích
- ✅ Đặt hàng và thanh toán VNPAY
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá sản phẩm

### Cho admin
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng
- ✅ Báo cáo doanh thu
- ✅ Quản lý mã giảm giá

## VNPAY Integration

Dự án đã tích hợp đầy đủ VNPAY payment gateway:

- **Tạo thanh toán**: Tạo URL thanh toán VNPAY
- **Xử lý callback**: Xử lý kết quả thanh toán từ VNPAY
- **IPN handling**: Xử lý thông báo server-to-server
- **Security**: Xác thực secure hash
- **Error handling**: Xử lý các mã lỗi VNPAY

## Database Schema

Database được thiết kế đầy đủ với các bảng:
- Users & Authentication
- Products & Categories
- Cart & Wishlist
- Orders & Payments
- Reviews & Ratings
- VNPAY Transactions
- System Settings

## Development

### Backend Commands
```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Lint code
```

### Frontend Commands
```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## License

MIT License
