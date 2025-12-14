import React, { useState, useEffect } from 'react'
import { Tag, Copy, Check, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

interface Coupon {
  id: number
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  startsAt?: string
  endsAt?: string
  isActive: boolean
}

export default function CouponSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    loadActiveCoupons()
  }, [])

  const loadActiveCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/coupons/active`)
      const result = await response.json()

      console.log('🔍 CouponSection - API Response:', result)
      console.log('🔍 CouponSection - Coupons array:', result.data?.coupons)
      console.log('🔍 CouponSection - Coupons length:', result.data?.coupons?.length)

      if (result.success && result.data?.coupons?.length > 0) {
        console.log('✅ CouponSection - Setting coupons:', result.data.coupons)
        setCoupons(result.data.coupons)
      } else {
        console.log('⚠️ CouponSection - No coupons found or invalid response')
      }
    } catch (error) {
      console.error('❌ CouponSection - Lỗi tải mã khuyến mãi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Đã sao chép mã khuyến mãi!')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  console.log('🔍 CouponSection - Render state:', { loading, couponsCount: coupons.length, coupons })

  if (loading) {
    return null
  }

  if (coupons.length === 0) {
    console.log('⚠️ CouponSection - No coupons to display')
    return null
  }

  console.log('🔍 CouponSection - About to render with', coupons.length, 'coupons')

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mã Khuyến Mãi Đang Áp Dụng
          </h2>
          <p className="text-lg text-gray-600">
            Áp dụng ngay để nhận ưu đãi hấp dẫn ({coupons.length} mã đang áp dụng)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon, index) => {
            console.log(`🔍 CouponSection - Rendering coupon ${index}:`, coupon)
            const discountText = coupon.type === 'PERCENT' 
              ? `Giảm ${coupon.value}%` 
              : `Giảm ${coupon.value.toLocaleString('vi-VN')}₫`

            const isCopied = copiedCode === coupon.code

            return (
              <Card key={coupon.id || `coupon-${index}`} className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-xl">
                {/* Decorative gradient background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-bl-full"></div>
                
                <div className="relative p-6">
                  {/* Coupon Code Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Mã khuyến mãi</span>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        aria-label="Sao chép mã"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 text-white">
                      <code className="text-2xl font-bold tracking-wider block text-center">
                        {coupon.code}
                      </code>
                    </div>
                  </div>

                  {/* Discount Info */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {discountText}
                    </div>
                    {coupon.maxDiscountAmount && coupon.type === 'PERCENT' && (
                      <div className="text-sm text-gray-600">
                        Tối đa {coupon.maxDiscountAmount.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {coupon.minOrderAmount && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">•</span>
                        <span>Áp dụng cho đơn hàng từ {coupon.minOrderAmount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )}
                    {coupon.endsAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          Hết hạn: {new Date(coupon.endsAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {!coupon.endsAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Calendar className="w-4 h-4" />
                        <span>Không giới hạn thời gian</span>
                      </div>
                    )}
                  </div>

                  {/* Use Now Button */}
                  <button
                    onClick={() => {
                      handleCopyCode(coupon.code)
                      window.location.href = '/products'
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sử dụng ngay
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

