import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, MapPin, CreditCard } from 'lucide-react'
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
  paymentStatus: string
  paymentMethod: string
  subtotalAmount: number
  discountAmount: number
  shippingFee: number
  totalAmount: number
  shippingAddressSnapshot: any
  notes?: string
  createdAt: string
  items: OrderItem[]
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await paymentApi.getOrderHistory()
      const orders = response.data.data?.orders || []
      const foundOrder = orders.find((o: Order) => o.id === Number(id))
      
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        toast.error('Không tìm thấy đơn hàng')
        navigate('/orders')
      }
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error)
      toast.error('Không thể tải thông tin đơn hàng')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      PREPARING: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-800', icon: Package },
      SHIPPING: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800', icon: Package },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
      REFUNDED: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    }
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy đơn hàng
          </h1>
          <Button onClick={() => navigate('/orders')}>
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusConfig(order.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/orders')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng {order.orderCode}
            </h1>
            <p className="text-gray-600">
              Đặt ngày {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4 inline mr-2" />
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm trong đơn hàng
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  {item.product.images.length > 0 && (
                    <img
                      src={item.product.images[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.productName}
                      {item.variantName && (
                        <span className="text-gray-600 ml-2">({item.variantName})</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.unitPrice)}₫
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng: {formatPrice(item.totalPrice)}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.shippingAddressSnapshot && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Địa chỉ giao hàng
              </h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{order.shippingAddressSnapshot.recipientName}</p>
                <p>{order.shippingAddressSnapshot.phone}</p>
                <p>{order.shippingAddressSnapshot.addressLine}</p>
                <p>
                  {order.shippingAddressSnapshot.ward}, {order.shippingAddressSnapshot.district}, {order.shippingAddressSnapshot.province}
                </p>
              </div>
            </Card>
          )}

          {/* Payment Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Thông tin thanh toán
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Phương thức:</span>
                <span className="font-medium">
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'VNPay'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
              </div>
            </div>
          </Card>

          {/* Order Total */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tổng đơn hàng
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotalAmount)}₫</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discountAmount)}₫</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}₫</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{formatPrice(order.totalAmount)}₫</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Ghi chú
              </h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
