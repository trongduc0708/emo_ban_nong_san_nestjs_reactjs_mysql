import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Package, Clock, MapPin } from 'lucide-react'
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
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await paymentApi.getOrderHistory()
      const orders = response.data.data?.orders || []
      const foundOrder = orders.find((o: Order) => o.id === Number(orderId))
      
      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        toast.error('Không tìm thấy đơn hàng')
        navigate('/')
      }
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error)
      toast.error('Không thể tải thông tin đơn hàng')
      navigate('/')
    } finally {
      setLoading(false)
    }
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
          <Button onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    )
  }

  // Kiểm tra trạng thái thanh toán
  const isPaymentSuccess = order.paymentStatus === 'PAID' || 
                          (order.paymentMethod === 'COD' && order.status !== 'CANCELLED')
  const isPaymentPending = order.paymentStatus === 'UNPAID' && order.paymentMethod === 'VNPAY'
  const isPaymentFailed = order.paymentStatus === 'FAILED' || order.status === 'CANCELLED'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        {isPaymentSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-gray-600">
              Cảm ơn bạn đã mua sắm tại Emo Nông Sản
            </p>
          </>
        ) : isPaymentPending ? (
          <>
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đang chờ thanh toán
            </h1>
            <p className="text-gray-600">
              Vui lòng hoàn tất thanh toán để đơn hàng được xử lý
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 text-red-500 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">✕</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-gray-600">
              Đơn hàng của bạn chưa được thanh toán thành công
            </p>
          </>
        )}
      </div>

      {/* Order Info */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin đơn hàng
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Mã đơn hàng</p>
            <p className="font-medium">{order.orderCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
            <p className="font-medium capitalize">{order.status.toLowerCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
            <p className={`font-medium ${
              order.paymentStatus === 'PAID' ? 'text-green-600' :
              order.paymentStatus === 'UNPAID' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {order.paymentStatus === 'PAID' ? 'Đã thanh toán' :
               order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' :
               order.paymentStatus === 'FAILED' ? 'Thanh toán thất bại' :
               'Không xác định'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phương thức thanh toán</p>
            <p className="font-medium">
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng tiền</p>
            <p className="font-medium text-green-600">
              {formatPrice(order.totalAmount)}₫
            </p>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Sản phẩm đã đặt
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
                  {formatPrice(item.totalPrice)}₫
                </p>
                <p className="text-sm text-gray-600">
                  {formatPrice(item.unitPrice)}₫/sản phẩm
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bước tiếp theo
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Xử lý đơn hàng</h3>
              <p className="text-sm text-gray-600">
                Chúng tôi sẽ xử lý đơn hàng của bạn trong vòng 24 giờ
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-orange-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Đóng gói và vận chuyển</h3>
              <p className="text-sm text-gray-600">
                Sản phẩm sẽ được đóng gói cẩn thận và giao trong 2-3 ngày làm việc
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900">Giao hàng</h3>
              <p className="text-sm text-gray-600">
                {order.paymentMethod === 'COD' 
                  ? 'Bạn sẽ thanh toán khi nhận hàng'
                  : isPaymentSuccess
                  ? 'Đơn hàng đã được thanh toán, bạn chỉ cần nhận hàng'
                  : 'Vui lòng hoàn tất thanh toán để đơn hàng được giao'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate('/products')}
          variant="outline"
          size="lg"
        >
          Tiếp tục mua sắm
        </Button>
        <Button
          onClick={() => navigate('/orders')}
          size="lg"
        >
          Xem đơn hàng của tôi
        </Button>
      </div>
    </div>
  )
}
