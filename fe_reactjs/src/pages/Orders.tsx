import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { formatPrice } from '@/utils/priceUtils'
import { paymentApi } from '@/services/api'
import toast from 'react-hot-toast'

interface OrderItem {
  id: number
  productName: string
  variantName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product: {
    images: Array<{ imageUrl: string }>
  }
}

interface Order {
  id: number
  orderCode: string
  status: string
  paymentMethod: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

const statusConfig = {
  PENDING: { label: 'Chờ xử lý', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-100', icon: Package },
  PREPARING: { label: 'Đang chuẩn bị', color: 'text-orange-600 bg-orange-100', icon: Package },
  SHIPPING: { label: 'Đang giao', color: 'text-purple-600 bg-purple-100', icon: Package },
  COMPLETED: { label: 'Hoàn thành', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-600 bg-red-100', icon: XCircle },
  REFUNDED: { label: 'Đã hoàn tiền', color: 'text-gray-600 bg-gray-100', icon: XCircle },
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    
    loadOrders()
  }, [user, navigate])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await paymentApi.getOrderHistory()
      setOrders(response.data.data?.orders || [])
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error)
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <Button onClick={() => navigate('/products')}>
          Tiếp tục mua sắm
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!
          </p>
          <Button onClick={() => navigate('/products')}>
            Mua sắm ngay
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = getStatusConfig(order.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.orderCode}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Đặt ngày {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4 inline mr-1" />
                      {statusInfo.label}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số sản phẩm</p>
                    <p className="font-medium">{order.items.length} sản phẩm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="font-medium text-green-600">
                      {formatPrice(order.totalAmount)}₫
                    </p>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Sản phẩm trong đơn hàng</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        {item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.productName}
                            {item.variantName && (
                              <span className="text-gray-600 ml-2">({item.variantName})</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} × {formatPrice(item.unitPrice)}₫
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {formatPrice(item.totalPrice)}₫
                        </p>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600 text-center">
                        và {order.items.length - 3} sản phẩm khác...
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}