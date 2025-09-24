import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginFormData {
  email: string
  password: string
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  // Xử lý đăng nhập thông thường
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      await login(data.email, data.password)
      toast.success('Đăng nhập thành công!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý đăng nhập Google (dùng ID token - Google Identity Services)
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)

      // Nạp SDK Google nếu chưa có
      if (!(window as any).google) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://accounts.google.com/gsi/client'
          s.onload = resolve
          s.onerror = () => reject(new Error('Failed to load Google API'))
          document.head.appendChild(s)
        })
      }

      const google = (window as any).google
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
        callback: async ({ credential }: { credential: string }) => {
          try {
            // Gửi ID token (credential) tới backend
            const result = await authApi.googleLogin(credential)
            localStorage.setItem('token', result.data.token)
            localStorage.setItem('user', JSON.stringify(result.data.user))
            toast.success('Đăng nhập Google thành công!')
            navigate('/')
          } catch (error: any) {
            toast.error(error.response?.data?.error || 'Đăng nhập Google thất bại')
          } finally {
            setIsGoogleLoading(false)
          }
        }
      })

      // Hiển thị chọn tài khoản
      google.accounts.id.prompt()
    } catch (error) {
      toast.error('Lỗi khởi tạo Google Sign-In')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-600">
            Đăng nhập để tiếp tục mua sắm
          </p>
        </div>

        {/* Login Form */}
        <Card className="space-y-6">
          {/* Google Login Button */}
          <div className="space-y-4">
            <GoogleButton
              onClick={handleGoogleLogin}
              loading={isGoogleLoading}
              disabled={isLoading}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Nhập email của bạn"
              icon={<Mail className="w-5 h-5" />}
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ'
                }
              })}
              error={errors.email?.message}
            />

            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                icon={<Lock className="w-5 h-5" />}
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                })}
                error={errors.password?.message}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-500 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isGoogleLoading}
            >
              Đăng nhập
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </Card>

        {/* Features */}
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">🚚</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Giao hàng nhanh</h3>
              <p className="text-xs text-gray-500">Trong vòng 24h</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">💳</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Thanh toán an toàn</h3>
              <p className="text-xs text-gray-500">VNPAY & COD</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🌱</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Nông sản sạch</h3>
              <p className="text-xs text-gray-500">100% tự nhiên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
