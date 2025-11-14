import React, { useState, useEffect } from 'react'
import { X, Tag, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminApi } from '@/services/api'
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

export default function CouponPopup() {
  const [show, setShow] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveCoupons()
  }, [])

  const loadActiveCoupons = async () => {
    try {
      setLoading(true)
      // Lấy coupons đang active từ endpoint public
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/coupons/active`)
      const result = await response.json()

      if (result.success && result.data?.coupons?.length > 0) {
        // Lấy coupon đầu tiên
        setCoupon(result.data.coupons[0])
        setShow(true)
      }
    } catch (error) {
      console.error('Lỗi tải mã khuyến mãi:', error)
      // Không hiển thị lỗi cho user, chỉ ẩn popup nếu không có coupon
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    if (coupon?.code) {
      navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      toast.success('Đã sao chép mã khuyến mãi!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setShow(false)
  }

  if (loading || !show || !coupon) {
    return null
  }

  const discountText = coupon.type === 'PERCENT' 
    ? `Giảm ${coupon.value}%` 
    : `Giảm ${coupon.value.toLocaleString('vi-VN')}₫`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="relative max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mã Khuyến Mãi Đặc Biệt!
          </h2>
          <p className="text-gray-600">
            Áp dụng ngay để nhận ưu đãi hấp dẫn
          </p>
        </div>

        {/* Coupon Code */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 mb-4 text-white text-center">
          <div className="text-sm mb-2 opacity-90">Mã khuyến mãi của bạn</div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <code className="text-3xl font-bold tracking-wider">
              {coupon.code}
            </code>
            <button
              onClick={handleCopyCode}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              aria-label="Sao chép mã"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-lg font-semibold">
            {discountText}
          </div>
          {coupon.minOrderAmount && (
            <div className="text-sm mt-2 opacity-90">
              Áp dụng cho đơn hàng từ {coupon.minOrderAmount.toLocaleString('vi-VN')}₫
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-6">
          {coupon.endsAt && (
            <div className="flex items-center justify-center gap-2">
              <span>⏰ Hết hạn:</span>
              <span className="font-medium">
                {new Date(coupon.endsAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
          >
            Đóng
          </Button>
          <Button
            onClick={() => {
              handleClose()
              window.location.href = '/products'
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            Mua ngay
          </Button>
        </div>
      </Card>
    </div>
  )
}

