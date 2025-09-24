import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCart } from '@/contexts/CartContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCard, Truck, MapPin, User, Phone } from 'lucide-react'

interface CheckoutFormData {
  fullName: string
  phone: string
  email: string
  province: string
  district: string
  ward: string
  address: string
  paymentMethod: 'vnpay' | 'cod'
  notes?: string
}

export default function Checkout() {
  const { items, totalPrice } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'cod'>('vnpay')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CheckoutFormData>()

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      // Xử lý đặt hàng
      console.log('Order data:', data)
      // TODO: Gọi API đặt hàng
    } catch (error) {
      console.error('Lỗi đặt hàng:', error)
    }
  }

  const shippingFee = 20000
  const total = totalPrice + shippingFee

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh Toán</h1>
        <p className="text-lg text-gray-600">
          Hoàn tất đơn hàng của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-500" />
              Thông tin giao hàng
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên *"
                placeholder="Nhập họ và tên"
                icon={<User className="w-5 h-5" />}
                {...register('fullName', { required: 'Họ và tên là bắt buộc' })}
                error={errors.fullName?.message}
              />
              
              <Input
                label="Số điện thoại *"
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
              
              <Input
                label="Email"
                type="email"
                placeholder="Nhập email"
                {...register('email')}
                error={errors.email?.message}
              />
              
              <Input
                label="Tỉnh/Thành phố *"
                placeholder="Nhập tỉnh/thành phố"
                {...register('province', { required: 'Tỉnh/thành phố là bắt buộc' })}
                error={errors.province?.message}
              />
              
              <Input
                label="Quận/Huyện *"
                placeholder="Nhập quận/huyện"
                {...register('district', { required: 'Quận/huyện là bắt buộc' })}
                error={errors.district?.message}
              />
              
              <Input
                label="Phường/Xã *"
                placeholder="Nhập phường/xã"
                {...register('ward', { required: 'Phường/xã là bắt buộc' })}
                error={errors.ward?.message}
              />
            </div>
            
            <div className="mt-4">
              <Input
                label="Địa chỉ chi tiết *"
                placeholder="Nhập địa chỉ chi tiết"
                {...register('address', { required: 'Địa chỉ chi tiết là bắt buộc' })}
                error={errors.address?.message}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú đơn hàng
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nhập ghi chú cho đơn hàng..."
              />
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-500" />
              Phương thức thanh toán
            </h2>
            
            <div className="space-y-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'vnpay'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPaymentMethod('vnpay')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                    className="mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Thanh toán online (VNPAY)</h3>
                    <p className="text-sm text-gray-600">
                      Thanh toán bằng thẻ ATM, Visa, Mastercard
                    </p>
                  </div>
                </div>
              </div>
              
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</h3>
                    <p className="text-sm text-gray-600">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-green-500" />
              Tóm tắt đơn hàng
            </h2>
            
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.unitPriceSnapshot * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">
                    {shippingFee.toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Đặt hàng
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}
