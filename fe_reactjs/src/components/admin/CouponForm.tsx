import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Tag,
  Percent,
  DollarSign,
  Calendar,
  Hash,
  FileText
} from 'lucide-react'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'

interface CouponFormProps {
  coupon?: any
  onClose: () => void
  onSuccess: () => void
}

export default function CouponForm({ coupon, onClose, onSuccess }: CouponFormProps) {
  /**
   * Chuyển đổi date string thành format YYYY-MM-DD an toàn
   * @param dateString - Chuỗi date cần chuyển đổi
   * @returns Chuỗi date format YYYY-MM-DD hoặc chuỗi rỗng nếu không hợp lệ
   */
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === null || dateString === undefined || dateString === '') {
      return ''
    }
    
    try {
      const date = new Date(dateString)
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', dateString)
        return ''
      }
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.warn('Error parsing date:', dateString, error)
      return ''
    }
  }

  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    startsAt: '',
    endsAt: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (coupon) {
      console.log('Coupon data received:', coupon)
      setFormData({
        code: coupon.code || '',
        type: coupon.type || 'PERCENT',
        value: coupon.value || 0,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        usageLimit: coupon.usageLimit || 0,
        startsAt: formatDateForInput(coupon.startsAt),
        endsAt: formatDateForInput(coupon.endsAt),
        isActive: coupon.isActive !== undefined ? coupon.isActive : true
      })
    } else {
      // Set default dates for new coupon
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthStr = nextMonth.toISOString().split('T')[0]
      
      setFormData(prev => ({
        ...prev,
        startsAt: today,
        endsAt: nextMonthStr
      }))
    }
  }, [coupon])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã coupon')
      return
    }
    if (formData.value <= 0) {
      toast.error('Giá trị coupon phải lớn hơn 0')
      return
    }
    if (formData.type === 'PERCENT' && formData.value > 100) {
      toast.error('Phần trăm giảm giá không được vượt quá 100%')
      return
    }
    if (new Date(formData.startsAt) >= new Date(formData.endsAt)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu')
      return
    }

    setLoading(true)

    try {
      const data = {
        ...formData,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: new Date(formData.endsAt).toISOString(),
        minOrderAmount: formData.minOrderAmount || null,
        maxDiscountAmount: formData.maxDiscountAmount || null,
        usageLimit: formData.usageLimit || null
      }

      if (coupon) {
        await adminApi.updateCoupon(parseInt(coupon.id), data)
        toast.success('Cập nhật coupon thành công')
      } else {
        await adminApi.createCoupon(data)
        toast.success('Tạo coupon thành công')
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu coupon')
      console.error('Error saving coupon:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {coupon ? 'Chỉnh sửa coupon' : 'Tạo coupon mới'}
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cơ bản</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã coupon *
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ví dụ: SALE20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="isActive"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="true">Hoạt động</option>
                    <option value="false">Tạm dừng</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Discount Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Cài đặt giảm giá</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại giảm giá *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (₫)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị giảm giá *
                  </label>
                  <div className="relative">
                    {formData.type === 'PERCENT' ? (
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    ) : (
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={formData.type === 'PERCENT' ? '20' : '50000'}
                      min="0"
                      max={formData.type === 'PERCENT' ? 100 : undefined}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn hàng tối thiểu (₫)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                {formData.type === 'PERCENT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giảm giá tối đa (₫)
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Usage Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Cài đặt sử dụng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giới hạn sử dụng
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0 (không giới hạn)"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Thời gian áp dụng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="startsAt"
                      value={formData.startsAt}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      name="endsAt"
                      value={formData.endsAt}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang lưu...' : (coupon ? 'Cập nhật' : 'Tạo coupon')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
