import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface AdminRedirectProps {
  children: React.ReactNode
}

export default function AdminRedirect({ children }: AdminRedirectProps) {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Chỉ redirect nếu user đã load xong và là admin hoặc seller
    if (!loading && user && (user.role === 'admin' || user.role === 'seller')) {
      // Kiểm tra nếu đang ở trang chủ hoặc các trang khách hàng
      const currentPath = window.location.pathname
      const adminPaths = ['/admin', '/admin/']
      const isOnAdminPage = adminPaths.some(path => currentPath.startsWith(path))
      
      // Nếu không phải trang admin, redirect đến admin dashboard
      if (!isOnAdminPage) {
        navigate('/admin', { replace: true })
      }
    }
  }, [user, loading, navigate])

  // Hiển thị loading khi đang kiểm tra auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
