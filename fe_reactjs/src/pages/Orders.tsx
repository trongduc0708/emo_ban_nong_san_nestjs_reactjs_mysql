import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Orders() {
  const [activeTab, setActiveTab] = useState('all')

  // Mock data - sẽ thay thế bằng API call
  const orders = [
    {
      id: 1,
      orderCode: 'EMO001',
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      totalAmount: 150000,
      createdAt: '2024-01-15',
      items: [
        { name: 'Cà chua hữu cơ', quantity: 2, price: 25000 },
        { name: 'Rau muống sạch', quantity: 1, price: 15000 }
      ]
    },
    {
      id: 2,
      orderCode: 'EMO002',
      status: 'SHIPPING',
      paymentStatus: 'PAID',
      totalAmount: 200000,
      createdAt: '2024-01-14',
      items: [
        { name: 'Táo đỏ tươi', quantity: 3, price: 45000 },
        { name: 'Chuối tiêu', quantity: 2, price: 20000 }
      ]
    },
    {
      id: 3,
      orderCode: 'EMO003',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalAmount: 100000,
      createdAt: '2024-01-13',
      items: [
        { name: 'Rau cải xanh', quantity: 2, price: 20000 },
        { name: 'Cà rốt', quantity: 1, price: 25000 }
      ]
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'SHIPPING':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Hoàn thành'
      case 'SHIPPING':
        return 'Đang giao hàng'
      case 'PENDING':
        return 'Chờ xử lý'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return status
    }
  }

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
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    return order.status.toLowerCase() === activeTab.toLowerCase()
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Đơn Hàng Của Tôi</h1>
        <p className="text-lg text-gray-600">
          Theo dõi trạng thái đơn hàng của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'all', name: 'Tất cả' },
            { id: 'pending', name: 'Chờ xử lý' },
            { id: 'shipping', name: 'Đang giao' },
            { id: 'completed', name: 'Hoàn thành' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa có đơn hàng nào trong danh mục này
            </p>
            <Button>
              Mua sắm ngay
            </Button>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="font-semibold text-gray-900">
                      Đơn hàng #{order.orderCode}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {order.totalAmount.toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Sản phẩm:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="outline" size="sm">
                  Xem chi tiết
                </Button>
                {order.status === 'PENDING' && (
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    Hủy đơn hàng
                  </Button>
                )}
                {order.status === 'COMPLETED' && (
                  <Button size="sm">
                    Mua lại
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
