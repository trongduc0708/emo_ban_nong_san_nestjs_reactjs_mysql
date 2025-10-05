import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authApi } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ForgotPasswordFormData {
  email: string
}

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true)
      await authApi.forgotPassword(data.email)
      setIsEmailSent(true)
      toast.success('Email đặt lại mật khẩu đã được gửi!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email đã được gửi!
            </h2>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. 
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full">
                  Quay lại đăng nhập
                </Button>
              </Link>
              <button
                onClick={() => setIsEmailSent(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Gửi lại email
              </button>
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
            Quên mật khẩu?
          </h2>
          <p className="text-gray-600">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <Card className="space-y-6">
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

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Gửi link đặt lại mật khẩu
            </Button>
          </form>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại đăng nhập
            </Link>
          </div>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
            <button
              onClick={() => setIsEmailSent(false)}
              className="text-green-600 hover:text-green-500 font-medium"
            >
              thử lại
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
