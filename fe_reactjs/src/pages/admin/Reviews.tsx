import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Star,
  Loader2,
  Clock
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Review {
  id: string
  userId: string
  productId: string
  orderId: string | null
  rating: number
  comment: string | null
  imagesJson: string[] | null
  isApproved: boolean
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
  }
  product: {
    id: string
    name: string
    slug: string
    images: Array<{ imageUrl: string }>
  }
  order: {
    id: string
    orderCode: string
  } | null
}

export default function AdminReviews() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterApproved, setFilterApproved] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject' | 'delete'; id: string } | null>(null)
  const queryClient = useQueryClient()
  const limit = 10

  // Fetch reviews
  const { data: reviewsData, isLoading, error } = useQuery(
    ['admin-reviews', currentPage, searchTerm, filterApproved, filterRating],
    () => adminApi.getReviews({
      page: currentPage,
      limit,
      search: searchTerm || undefined,
      isApproved: filterApproved === 'all' ? undefined : filterApproved === 'approved',
      rating: filterRating === 'all' ? undefined : filterRating
    }).then(res => res.data),
    { keepPreviousData: true }
  )

  const reviews = reviewsData?.reviews || []
  const pagination = reviewsData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }

  // Approve review mutation
  const approveMutation = useMutation(
    (id: number) => adminApi.approveReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-reviews'])
        toast.success('Đã phê duyệt đánh giá')
      },
      onError: () => {
        toast.error('Lỗi khi phê duyệt đánh giá')
      }
    }
  )

  // Reject review mutation
  const rejectMutation = useMutation(
    (id: number) => adminApi.rejectReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-reviews'])
        toast.success('Đã từ chối đánh giá')
      },
      onError: () => {
        toast.error('Lỗi khi từ chối đánh giá')
      }
    }
  )

  // Delete review mutation
  const deleteMutation = useMutation(
    (id: number) => adminApi.deleteReview(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-reviews'])
        toast.success('Đã xóa đánh giá')
      },
      onError: () => {
        toast.error('Lỗi khi xóa đánh giá')
      }
    }
  )

  const handleApprove = (id: string) => {
    setConfirmAction({ type: 'approve', id })
    setShowConfirmDialog(true)
  }

  const handleReject = (id: string) => {
    setConfirmAction({ type: 'reject', id })
    setShowConfirmDialog(true)
  }

  const handleDelete = (id: string) => {
    setConfirmAction({ type: 'delete', id })
    setShowConfirmDialog(true)
  }

  const executeConfirmAction = () => {
    if (!confirmAction) return
    
    switch (confirmAction.type) {
      case 'approve':
        approveMutation.mutate(parseInt(confirmAction.id))
        break
      case 'reject':
        rejectMutation.mutate(parseInt(confirmAction.id))
        break
      case 'delete':
        deleteMutation.mutate(parseInt(confirmAction.id))
        break
    }
    
    setShowConfirmDialog(false)
    setConfirmAction(null)
  }

  const getConfirmMessage = () => {
    if (!confirmAction) return ''
    switch (confirmAction.type) {
      case 'approve':
        return 'Bạn có chắc muốn phê duyệt đánh giá này?'
      case 'reject':
        return 'Bạn có chắc muốn từ chối đánh giá này?'
      case 'delete':
        return 'Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.'
      default:
        return ''
    }
  }

  const getConfirmVariant = () => {
    if (!confirmAction) return 'info'
    return confirmAction.type === 'delete' ? 'danger' : 'warning'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const stats = {
    total: pagination.total,
    approved: reviews.filter((r: Review) => r.isApproved).length,
    pending: reviews.filter((r: Review) => !r.isApproved).length
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Đánh giá</h1>
          <p className="text-gray-600">Phê duyệt và quản lý đánh giá từ khách hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã phê duyệt</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Tìm kiếm theo nội dung, sản phẩm, khách hàng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                icon={<Search className="w-5 h-5 text-gray-400" />}
              />
            </div>
            <div>
              <select
                value={filterApproved}
                onChange={(e) => {
                  setFilterApproved(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã phê duyệt</option>
                <option value="pending">Chờ phê duyệt</option>
              </select>
            </div>
            <div>
              <select
                value={filterRating}
                onChange={(e) => {
                  setFilterRating(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Có lỗi xảy ra khi tải dữ liệu
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có đánh giá nào
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: Review) => (
                <div
                  key={review.id}
                  className={`p-6 border rounded-lg ${
                    review.isApproved
                      ? 'border-green-200 bg-green-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          {review.user.avatarUrl ? (
                            <img
                              src={review.user.avatarUrl}
                              alt={review.user.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-green-600 font-semibold">
                              {review.user.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">{review.user.email}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            review.isApproved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {review.isApproved ? 'Đã phê duyệt' : 'Chờ phê duyệt'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Sản phẩm:</span>
                          <a
                            href={`/products/${review.product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:underline"
                          >
                            {review.product.name}
                          </a>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                        )}
                        {review.imagesJson && review.imagesJson.length > 0 && (
                          <div className="flex space-x-2 mt-2">
                            {review.imagesJson.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {!review.isApproved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(review.id)}
                          disabled={approveMutation.isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Phê duyệt
                        </Button>
                      )}
                      {review.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(review.id)}
                          disabled={rejectMutation.isLoading}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy phê duyệt
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review.id)}
                        disabled={deleteMutation.isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-700">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} đánh giá
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pagination.page === 1}
                >
                  Trước
                </Button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={pagination.page === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page === pagination.pages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title={confirmAction?.type === 'delete' ? 'Xác nhận xóa' : confirmAction?.type === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
          message={getConfirmMessage()}
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={executeConfirmAction}
          onCancel={() => {
            setShowConfirmDialog(false)
            setConfirmAction(null)
          }}
          variant={getConfirmVariant()}
        />
      </div>
    </AdminLayout>
  )
}

