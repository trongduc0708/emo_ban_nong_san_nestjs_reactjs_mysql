import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
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

  // Cần quyền admin nhưng user không phải admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
