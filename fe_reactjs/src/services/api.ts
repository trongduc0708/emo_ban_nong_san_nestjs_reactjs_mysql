import axios from 'axios'

// Cấu hình axios base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor để thêm token vào request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, đăng xuất user
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API cho Authentication
export const authApi = {
  // Đăng nhập
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  // Đăng ký
  register: (data: {
    email: string
    password: string
    fullName: string
    phone?: string
  }) => api.post('/auth/register', data),
  
  // Đăng nhập Google
  googleLogin: (idToken: string) =>
    api.post('/auth/google', { idToken }),
  
  // Quên mật khẩu
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  // Đặt lại mật khẩu
  resetPassword: (data: {
    token: string
    newPassword: string
  }) => api.post('/auth/reset-password', data),
  
  // Validate reset token
  validateResetToken: (token: string) =>
    api.get('/auth/validate-reset-token', { params: { token } }),
  
  // Đổi mật khẩu
  changePassword: (data: {
    currentPassword: string
    newPassword: string
  }) => api.post('/auth/change-password', data),
  
  // Lấy thông tin user hiện tại
  getProfile: () => api.get('/auth/profile'),
  
  // Cập nhật profile
  updateProfile: (data: {
    fullName?: string
    phone?: string
    avatarUrl?: string
  }) => api.put('/auth/profile', data),
}

// API cho Products
export const productApi = {
  // Lấy danh sách sản phẩm
  getProducts: (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sort?: string
    minPrice?: number
    maxPrice?: number
  }) => api.get('/products', { params }),
  
  // Lấy chi tiết sản phẩm
  getProduct: (id: number) => api.get(`/products/${id}`),
  
  // Lấy sản phẩm nổi bật
  getFeaturedProducts: (limit?: number) => api.get('/products/featured', { params: { limit } }),
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (categorySlug: string, limit?: number) => 
    api.get(`/products/category/${categorySlug}`, { params: { limit } }),
  
  // Lấy danh mục
  getCategories: () => api.get('/categories'),
  
  // Giỏ hàng
  getCart: () => api.get('/cart'),
  addToCart: (data: {
    productId: number
    variantId?: number | null
    quantity: number
  }) => api.post('/cart/items', data),
  updateCartItem: (itemId: number, data: { quantity: number }) =>
    api.put(`/cart/items/${itemId}`, data),
  removeFromCart: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
  
  // Yêu thích
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (data: {
    productId: number
    variantId?: number | null
  }) => api.post('/wishlist/items', data),
  removeFromWishlist: (itemId: number) =>
    api.delete(`/wishlist/items/${itemId}`),
}

// API cho Orders
export const orderApi = {
  // Lấy danh sách đơn hàng
  getOrders: (params?: { page?: number; limit?: number }) =>
    api.get('/orders', { params }),
  
  // Lấy chi tiết đơn hàng
  getOrder: (id: number) => api.get(`/orders/${id}`),
  
  // Tạo đơn hàng
  createOrder: (data: {
    shippingAddress: any
    paymentMethod: string
    notes?: string
  }) => api.post('/orders', data),
  
  // Hủy đơn hàng
  cancelOrder: (id: number) => api.put(`/orders/${id}/cancel`),
}

// API cho Payment
export const paymentApi = {
  // Tạo thanh toán VNPAY
  createVnpayPayment: (data: {
    orderId: number
    amount: number
    returnUrl: string
  }) => api.post('/payment/vnpay', data),
  
  // Xử lý callback từ VNPAY
  handleVnpayReturn: (params: any) =>
    api.get('/payment/vnpay-return', { params }),
}

// API cho Admin
export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // Quản lý sản phẩm
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: number, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  
  // Quản lý đơn hàng
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  
  // Quản lý người dùng
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
}

// API cho Addresses
export const addressesApi = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data: {
    recipientName: string
    phone: string
    province: string
    district: string
    ward: string
    addressLine: string
    isDefault?: boolean
  }) => api.post('/addresses', data),
  updateAddress: (id: number, data: Partial<{
    recipientName: string
    phone: string
    province: string
    district: string
    ward: string
    addressLine: string
    isDefault: boolean
  }>) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/addresses/${id}`),
}

export default api
