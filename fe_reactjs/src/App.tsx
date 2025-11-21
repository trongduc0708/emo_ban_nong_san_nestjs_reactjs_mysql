import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import Layout from '@/components/Layout'
import AppWrapper from '@/components/AppWrapper'
import AdminRedirect from '@/components/AdminRedirect'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Profile from '@/pages/Profile'
import Orders from '@/pages/Orders'
import OrderDetail from '@/pages/OrderDetail'
import OrderSuccess from '@/pages/OrderSuccess'
import OrderFailed from '@/pages/OrderFailed'
import VNPayReturnPage from '@/pages/VNPayReturnPage'
import Wishlist from '@/pages/Wishlist'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminCategories from '@/pages/admin/Categories'
import AdminCoupons from '@/pages/admin/Coupons'
import AdminOrders from '@/pages/admin/Orders'
import AdminUsers from '@/pages/admin/Users'
import AdminReviews from '@/pages/admin/Reviews'
import AdminSettings from '@/pages/admin/Settings'
import AdminReports from '@/pages/admin/Reports'
import ProtectedRoute from '@/components/ProtectedRoute'
import About from '@/pages/About'
import Policy from '@/pages/Policy'
import GoogleCallback from '@/pages/GoogleCallback'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin Routes - Layout riêng biệt */}
        {/* Dashboard - Admin và Seller đều truy cập được */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdminOrSeller>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        {/* Orders - Admin và Seller đều truy cập được */}
        <Route path="/admin/orders" element={
          <ProtectedRoute requireAdminOrSeller>
            <AdminOrders />
          </ProtectedRoute>
        } />
        {/* Các route chỉ dành cho Admin */}
        <Route path="/admin/products" element={
          <ProtectedRoute requireAdmin>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute requireAdmin>
            <AdminCategories />
          </ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute requireAdmin>
            <AdminCoupons />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/reviews" element={
          <ProtectedRoute requireAdmin>
            <AdminReviews />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requireAdmin>
            <AdminReports />
          </ProtectedRoute>
        } />
        
        {/* Customer Routes - Layout chung */}
        <Route path="/*" element={
          <CartProvider>
            <WishlistProvider>
              <AppWrapper>
                <AdminRedirect>
                  <Layout>
                    <Routes>
                      {/* Trang công khai */}
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/policy" element={<Policy />} />
                      <Route path="/cart" element={<Cart />} />
                      
                      {/* Xác thực */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/auth/google/callback" element={<GoogleCallback />} />
                      
                      {/* Trang cần đăng nhập */}
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      } />
                      <Route path="/orders/:id" element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/wishlist" element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } />
                      <Route path="/order-success/:orderId" element={
                        <ProtectedRoute>
                          <OrderSuccess />
                        </ProtectedRoute>
                      } />
                      <Route path="/order-failed" element={<OrderFailed />} />
                      <Route path="/payment/vnpay/return" element={<VNPayReturnPage />} />
                    </Routes>
                  </Layout>
                </AdminRedirect>
              </AppWrapper>
            </WishlistProvider>
          </CartProvider>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
