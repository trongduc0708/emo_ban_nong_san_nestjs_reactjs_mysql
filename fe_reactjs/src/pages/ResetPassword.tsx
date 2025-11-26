import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormData>()

  const newPassword = watch('newPassword')

  // Validate token khi component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsTokenValid(false)
        setIsValidating(false)
        return
      }

      try {
        await authApi.validateResetToken(token)
        setIsTokenValid(true)
      } catch (error: any) {
        setIsTokenValid(false)
        toast.error(error.response?.data?.error || 'Token không hợp lệ')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    try {
      setIsLoading(true)
      await authApi.resetPassword({ token, newPassword: data.newPassword })
      toast.success('Đặt lại mật khẩu thành công!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác thực token...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Token không hợp lệ
            </h2>
            <p className="text-gray-600 mb-6">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. 
              Vui lòng yêu cầu link mới.
            </p>
            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">
                  Yêu cầu link mới
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
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
            Đặt lại mật khẩu
          </h2>
          <p className="text-gray-600">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        {/* Form */}
        <Card className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu mới"
              icon={<Lock className="w-5 h-5" />}
              {...register('newPassword', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              })}
              error={errors.newPassword?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              }
            />

            <Input
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              icon={<Lock className="w-5 h-5" />}
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: (value) =>
                  value === newPassword || 'Mật khẩu xác nhận không khớp'
              })}
              error={errors.confirmPassword?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Đặt lại mật khẩu
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Mật khẩu phải có ít nhất 6 ký tự và bao gồm chữ cái và số
          </p>
        </div>
      </div>
    </div>
  )
}
