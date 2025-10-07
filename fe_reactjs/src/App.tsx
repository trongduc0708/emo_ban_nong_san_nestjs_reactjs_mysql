import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import Layout from '@/components/Layout'
import AppWrapper from '@/components/AppWrapper'
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
import OrderSuccess from '@/pages/OrderSuccess'
import AdminDashboard from '@/pages/admin/Dashboard'
import ProtectedRoute from '@/components/ProtectedRoute'
import About from '@/pages/About'
import Policy from '@/pages/Policy'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppWrapper>
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
            <Route path="/order-success/:orderId" element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } />
            
            {/* Admin */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            </Routes>
          </Layout>
        </AppWrapper>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
