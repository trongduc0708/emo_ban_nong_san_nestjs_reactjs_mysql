import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Filter, Tag, Percent, DollarSign, Calendar, Hash } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import CouponForm from '@/components/admin/CouponForm'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Coupon {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  startsAt: string
  endsAt: string
  isActive: boolean
  _count?: {
    orders: number
  }
}

export default function AdminCoupons() {
  /**
   * Format date an toàn cho hiển thị
   * @param dateString - Chuỗi date cần format
   * @returns Chuỗi date đã format hoặc "Chưa có" nếu không hợp lệ
   */
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === null || dateString === undefined) {
      return 'Chưa có'
    }
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Chưa có'
      }
      return date.toLocaleDateString('vi-VN')
    } catch (error) {
      console.warn('Invalid date format:', dateString)
      return 'Chưa có'
    }
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  /**
   * Tải danh sách coupons từ API với phân trang, tìm kiếm và lọc
   */
  const loadCoupons = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getCoupons({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus,
        type: filterType === 'all' ? undefined : filterType
      })
      
      console.log('Coupons data received:', response.data.coupons)
      setCoupons(response.data.coupons)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      }))
    } catch (error) {
      console.error('Error loading coupons:', error)
      toast.error('Lỗi khi tải danh sách coupons')
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [pagination.page, searchTerm, filterStatus, filterType])

  /**
   * Xóa coupon với xác nhận từ người dùng
   * @param id - ID của coupon cần xóa
   */
  const handleDeleteCoupon = (id: string) => {
    setCouponToDelete(id)
    setShowConfirmDialog(true)
  }

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return
    try {
      await adminApi.deleteCoupon(parseInt(couponToDelete))
      toast.success('Xóa coupon thành công')
      loadCoupons()
      setShowConfirmDialog(false)
      setCouponToDelete(null)
    } catch (error: any) {
      console.error('Error deleting coupon:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi xóa coupon')
      setShowConfirmDialog(false)
      setCouponToDelete(null)
    }
  }

  /**
   * Mở form thêm coupon mới
   */
  const handleAddCoupon = () => {
    setEditingCoupon(null)
    setShowForm(true)
  }

  /**
   * Mở form chỉnh sửa coupon
   * @param coupon - Coupon cần chỉnh sửa
   */
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setShowForm(true)
  }

  /**
   * Đóng form coupon và reset state
   */
  const handleFormClose = () => {
    setShowForm(false)
    setEditingCoupon(null)
  }

  /**
   * Xử lý khi form lưu thành công - reload danh sách coupons
   */
  const handleFormSuccess = () => {
    loadCoupons()
  }

  /**
   * Lấy màu sắc cho trạng thái coupon
   * @param isActive - Trạng thái hoạt động của coupon
   * @returns CSS classes cho màu sắc
   */
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100'
  }

  /**
   * Lấy text hiển thị cho trạng thái coupon
   * @param isActive - Trạng thái hoạt động của coupon
   * @returns Text hiển thị
   */
  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Hoạt động' : 'Tạm dừng'
  }

  /**
   * Lấy màu sắc cho loại coupon
   * @param type - Loại coupon
   * @returns CSS classes cho màu sắc
   */
  const getTypeColor = (type: string) => {
    return type === 'PERCENT' 
      ? 'text-blue-600 bg-blue-100'
      : 'text-purple-600 bg-purple-100'
  }

  /**
   * Lấy text hiển thị cho loại coupon
   * @param type - Loại coupon
   * @returns Text hiển thị
   */
  const getTypeText = (type: string) => {
    return type === 'PERCENT' ? 'Phần trăm' : 'Số tiền cố định'
  }

  /**
   * Kiểm tra coupon có hết hạn không
   * @param endsAt - Ngày kết thúc
   * @returns True nếu đã hết hạn
   */
  const isExpired = (endsAt: string | null | undefined) => {
    if (!endsAt || endsAt === null || endsAt === undefined) {
      return false
    }
    
    try {
      const endDate = new Date(endsAt)
      if (isNaN(endDate.getTime())) {
        return false
      }
      return endDate < new Date()
    } catch (error) {
      console.warn('Invalid date format for expiration check:', endsAt)
      return false
    }
  }

  /**
   * Lọc coupons theo từ khóa tìm kiếm và trạng thái
   */
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && coupon.isActive) ||
                         (filterStatus === 'inactive' && !coupon.isActive)
    const matchesType = filterType === 'all' || coupon.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  // Stats
  const totalCoupons = coupons.length
  const activeCoupons = coupons.filter(c => c.isActive).length
  const expiredCoupons = coupons.filter(c => isExpired(c.endsAt)).length
  const totalUsage = coupons.reduce((sum, c) => sum + (c._count?.orders || 0), 0)

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý mã giảm giá</h1>
              <p className="text-gray-600">Tạo và quản lý các mã giảm giá cho khách hàng.</p>
            </div>
            <Button onClick={handleAddCoupon}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo coupon mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng coupons</p>
                <p className="text-2xl font-bold text-gray-900">{totalCoupons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Hash className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{activeCoupons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã hết hạn</p>
                <p className="text-2xl font-bold text-gray-900">{expiredCoupons}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng lượt sử dụng</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm coupon..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
          <div className="relative">
            <select
              className="w-full md:w-48 pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="PERCENT">Phần trăm</option>
              <option value="FIXED">Số tiền cố định</option>
            </select>
          </div>
        </div>

        {/* Coupons List */}
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có coupon nào</h3>
              <p className="text-gray-600 mb-4">Bắt đầu tạo coupon đầu tiên của bạn.</p>
              <Button onClick={handleAddCoupon}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo coupon mới
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã coupon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sử dụng
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Tag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                            <div className="text-sm text-gray-500">ID: #{coupon.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(coupon.type)}`}>
                          {getTypeText(coupon.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {coupon.type === 'PERCENT' 
                              ? `${coupon.value}%` 
                              : `${coupon.value.toLocaleString('vi-VN')}₫`
                            }
                          </div>
                          {coupon.minOrderAmount && (
                            <div className="text-xs text-gray-500">
                              Tối thiểu: {coupon.minOrderAmount.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="text-xs text-gray-500">Từ: {formatDateForDisplay(coupon.startsAt)}</div>
                          <div className={`text-xs ${isExpired(coupon.endsAt) ? 'text-red-500' : 'text-gray-500'}`}>
                            Đến: {formatDateForDisplay(coupon.endsAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon.isActive)}`}>
                          {getStatusText(coupon.isActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{coupon._count?.orders || 0} lượt</div>
                          {coupon.usageLimit && (
                            <div className="text-xs text-gray-500">
                              Giới hạn: {coupon.usageLimit}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} coupons
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Trước
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}

        {/* Coupon Form Modal */}
        {showForm && (
          <CouponForm
            coupon={editingCoupon}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận xóa coupon"
          message="Bạn có chắc chắn muốn xóa coupon này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDeleteCoupon}
          onCancel={() => {
            setShowConfirmDialog(false)
            setCouponToDelete(null)
          }}
          variant="danger"
        />
      </div>
    </AdminLayout>
  )
}
