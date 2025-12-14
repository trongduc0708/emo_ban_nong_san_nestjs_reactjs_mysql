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
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set())
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
        // Lấy tất cả coupons
        setCoupons(result.data.coupons)
        setShow(true)
      }
    } catch (error) {
      console.error('Lỗi tải mã khuyến mãi:', error)
      // Không hiển thị lỗi cho user, chỉ ẩn popup nếu không có coupon
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string, couponId: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodes(prev => new Set(prev).add(couponId))
    toast.success('Đã sao chép mã khuyến mãi!')
    setTimeout(() => {
      setCopiedCodes(prev => {
        const newSet = new Set(prev)
        newSet.delete(couponId)
        return newSet
      })
    }, 2000)
  }

  const handleClose = () => {
    setShow(false)
  }

  if (loading || !show || coupons.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="relative max-w-2xl w-full max-h-[90vh] p-6 animate-in fade-in zoom-in duration-300 overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
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
          {coupons.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {coupons.length} mã khuyến mãi đang áp dụng
            </p>
          )}
        </div>

        {/* Coupons List */}
        <div className="space-y-4 mb-6">
          {coupons.map((coupon) => {
            const discountText = coupon.type === 'PERCENT' 
              ? `Giảm ${coupon.value}%` 
              : `Giảm ${coupon.value.toLocaleString('vi-VN')}₫`
            const isCopied = copiedCodes.has(coupon.id)

            return (
              <div
                key={coupon.id}
                className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-5 text-white relative"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-2xl font-bold tracking-wider">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.code, coupon.id)}
                        className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        aria-label="Sao chép mã"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      {discountText}
                    </div>
                    {coupon.minOrderAmount && (
                      <div className="text-sm opacity-90 mb-1">
                        Áp dụng cho đơn hàng từ {coupon.minOrderAmount.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                    {coupon.endsAt && (
                      <div className="text-sm opacity-90">
                        ⏰ Hết hạn: {new Date(coupon.endsAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    {!coupon.endsAt && (
                      <div className="text-sm opacity-90">
                        ⏰ Không giới hạn thời gian
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
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

