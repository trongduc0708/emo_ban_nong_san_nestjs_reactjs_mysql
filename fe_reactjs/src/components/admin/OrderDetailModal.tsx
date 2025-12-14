import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface OrderDetailModalProps {
  order: any
  onClose: () => void
  onStatusChange?: (orderId: string, newStatus: string) => void
  onPaymentStatusChange?: (orderId: string, newPaymentStatus: string) => void
}

export default function OrderDetailModal({ order, onClose, onStatusChange, onPaymentStatusChange }: OrderDetailModalProps) {
  if (!order) return null

  // Debug: Log shippingAddressSnapshot để kiểm tra
  console.log('Order shippingAddressSnapshot:', order.shippingAddressSnapshot)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'SHIPPING':
        return 'text-blue-600 bg-blue-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED':
        return 'text-red-600 bg-red-100'
      case 'REFUNDED':
        return 'text-gray-600 bg-gray-100'
      case 'RETURNED':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành'
      case 'SHIPPING':
        return 'Đang giao'
      case 'PENDING':
        return 'Chờ xử lý'
      case 'CANCELLED':
        return 'Đã hủy'
      case 'REFUNDED':
        return 'Đã hoàn tiền'
      case 'RETURNED':
        return 'Đã hoàn hàng'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return CheckCircle
      case 'SHIPPING':
        return Truck
      case 'PENDING':
        return Clock
      case 'CANCELLED':
        return XCircle
      case 'REFUNDED':
        return XCircle
      case 'RETURNED':
        return XCircle
      default:
        return Package
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100'
      case 'UNPAID':
        return 'text-red-600 bg-red-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán'
      case 'UNPAID':
        return 'Chưa thanh toán'
      case 'FAILED':
        return 'Thanh toán thất bại'
      default:
        return status
    }
  }

  const StatusIcon = getStatusIcon(order.status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết đơn hàng #{order.orderCode}
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thông tin đơn hàng */}
            <div className="space-y-6">
              {/* Trạng thái đơn hàng */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <StatusIcon className="w-5 h-5 mr-2" />
                  Trạng thái đơn hàng
                </h3>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  {onStatusChange && (
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="CONFIRMED">Đã xác nhận</option>
                      <option value="PREPARING">Đang chuẩn bị</option>
                      <option value="SHIPPING">Đang giao</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="CANCELLED">Đã hủy</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                      <option value="RETURNED">Đã hoàn hàng</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin khách hàng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Tên:</span> {order.user?.fullName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {order.user?.email || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Số điện thoại:</span> {order.user?.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Địa chỉ giao hàng
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {order.shippingAddressSnapshot && typeof order.shippingAddressSnapshot === 'object' ? (
                    <div className="space-y-1 text-sm">
                      <div><strong>Người nhận:</strong> {order.shippingAddressSnapshot.recipientName || 'N/A'}</div>
                      <div><strong>Số điện thoại:</strong> {order.shippingAddressSnapshot.phone || 'N/A'}</div>
                      <div><strong>Địa chỉ:</strong> {order.shippingAddressSnapshot.addressLine || 'N/A'}</div>
                      <div><strong>Phường/Xã:</strong> {order.shippingAddressSnapshot.ward || 'N/A'}</div>
                      <div><strong>Quận/Huyện:</strong> {order.shippingAddressSnapshot.district || 'N/A'}</div>
                      <div><strong>Tỉnh/Thành phố:</strong> {order.shippingAddressSnapshot.province || 'N/A'}</div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Không có thông tin địa chỉ</p>
                  )}
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán và sản phẩm */}
            <div className="space-y-6">
              {/* Thông tin thanh toán */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Thông tin thanh toán
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng:</span>
                    <span>{Number(order.subtotalAmount).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giảm giá:</span>
                    <span>-{Number(order.discountAmount).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span>{Number(order.shippingFee).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span>{Number(order.totalAmount).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                    {onPaymentStatusChange && (
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => onPaymentStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="UNPAID">Chưa thanh toán</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="FAILED">Thanh toán thất bại</option>
                        <option value="REFUNDED">Đã hoàn tiền</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Sản phẩm đã đặt
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          {item.variantName && (
                            <p className="text-sm text-gray-600">Phân loại: {item.variantName}</p>
                          )}
                          {item.sku && (
                            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                          )}
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Number(item.unitPrice).toLocaleString('vi-VN')}₫</p>
                          <p className="text-sm text-gray-600">Tổng: {Number(item.totalPrice).toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Thông tin thời gian
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="font-medium">Ngày tạo:</span> {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <span className="font-medium">Cập nhật lần cuối:</span> {new Date(order.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {order.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ghi chú</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{order.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
