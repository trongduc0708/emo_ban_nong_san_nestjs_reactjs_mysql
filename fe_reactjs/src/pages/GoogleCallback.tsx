import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setToken } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const redirect = searchParams.get('redirect') || '/'
    const error = searchParams.get('error')

    if (error) {
      toast.error(`Đăng nhập Google thất bại: ${error}`)
      navigate('/login')
      return
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        
        // Lưu token và user vào localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Cập nhật auth context - CẢ user VÀ token
        setToken(token)
        setUser(user)
        
        toast.success('Đăng nhập Google thành công!')
        navigate(redirect)
      } catch (err) {
        console.error('Error parsing user data:', err)
        toast.error('Lỗi xử lý dữ liệu đăng nhập')
        navigate('/login')
      }
    } else {
      toast.error('Không nhận được thông tin đăng nhập')
      navigate('/login')
    }
  }, [searchParams, navigate, setUser, setToken])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập Google...</p>
      </div>
    </div>
  )
}

