import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireAdminOrSeller?: boolean
  allowedRoles?: ('admin' | 'seller' | 'customer')[]
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireAdminOrSeller = false,
  allowedRoles
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Hiển thị loading khi đang kiểm tra auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  // Chưa đăng nhập, redirect về trang login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kiểm tra quyền truy cập
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  if (requireAdminOrSeller && user.role !== 'admin' && user.role !== 'seller') {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
