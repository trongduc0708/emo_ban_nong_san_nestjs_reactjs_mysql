import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

interface RegisterFormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>()

  const password = watch('password')

  // Xử lý đăng ký thông thường
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone
      })
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Đăng ký thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý đăng ký Google
  const handleGoogleRegister = async () => {
    try {
      setIsGoogleLoading(true)
      
      // Load Google API
      if (!window.google) {
        await loadGoogleAPI()
      }

      // Khởi tạo Google Sign-In
      const authInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: async (response: any) => {
          try {
            // Gửi token đến backend
            const result = await authApi.googleLogin(response.access_token)
            
            // Lưu thông tin user
            localStorage.setItem('token', result.data.token)
            localStorage.setItem('user', JSON.stringify(result.data.user))
            
            toast.success('Đăng ký Google thành công!')
            navigate('/')
          } catch (error: any) {
            toast.error(error.response?.data?.error || 'Đăng ký Google thất bại')
          } finally {
            setIsGoogleLoading(false)
          }
        }
      })

      authInstance.requestAccessToken()
    } catch (error: any) {
      toast.error('Lỗi khởi tạo Google Sign-In')
      setIsGoogleLoading(false)
    }
  }

  // Load Google API
  const loadGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve(window.google)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => resolve(window.google)
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.head.appendChild(script)
    })
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
            Tạo tài khoản mới
          </h2>
          <p className="text-gray-600">
            Đăng ký để bắt đầu mua sắm
          </p>
        </div>

        {/* Register Form */}
        <Card className="space-y-6">
          {/* Google Register Button */}
          <div className="space-y-4">
            <GoogleButton
              onClick={handleGoogleRegister}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nhập họ và tên"
              icon={<User className="w-5 h-5" />}
              {...register('fullName', {
                required: 'Họ và tên là bắt buộc',
                minLength: {
                  value: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự'
                }
              })}
              error={errors.fullName?.message}
            />

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

            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="Nhập số điện thoại"
              icon={<Phone className="w-5 h-5" />}
              {...register('phone', {
                required: 'Số điện thoại là bắt buộc',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ'
                }
              })}
              error={errors.phone?.message}
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

            <div className="relative">
              <Input
                label="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu"
                icon={<Lock className="w-5 h-5" />}
                {...register('confirmPassword', {
                  required: 'Xác nhận mật khẩu là bắt buộc',
                  validate: value => value === password || 'Mật khẩu không khớp'
                })}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-500">
                  Điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-500">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isGoogleLoading}
            >
              Đăng ký
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </Card>

        {/* Benefits */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            Tại sao chọn Emo Nông Sản?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">Nông sản tươi ngon</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">Giao hàng miễn phí</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">Thanh toán an toàn</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-sm text-gray-700">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
