import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Package, DollarSign, TrendingUp, Plus, Eye } from 'lucide-react'

export default function AdminDashboard() {
  // Mock data - sẽ thay thế bằng API call
  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Package
    },
    {
      title: 'Doanh thu',
      value: '45.6M₫',
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Khách hàng',
      value: '2,456',
      change: '+15%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Tăng trưởng',
      value: '23.5%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ]

  const recentOrders = [
    {
      id: 1,
      customer: 'Nguyễn Văn A',
      total: 150000,
      status: 'COMPLETED',
      date: '2024-01-15'
    },
    {
      id: 2,
      customer: 'Trần Thị B',
      total: 200000,
      status: 'SHIPPING',
      date: '2024-01-14'
    },
    {
      id: 3,
      customer: 'Lê Văn C',
      total: 100000,
      status: 'PENDING',
      date: '2024-01-13'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'SHIPPING':
        return 'text-blue-600 bg-blue-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
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
      default:
        return status
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-lg text-gray-600">
          Tổng quan về hoạt động kinh doanh
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} so với tháng trước
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Đơn hàng gần đây</h2>
              <Button variant="outline" size="sm">
                Xem tất cả
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">#{order.id}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">
                      {order.total.toLocaleString('vi-VN')}₫
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thao tác nhanh</h2>
            
            <div className="space-y-4">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm mới
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="w-4 h-4 mr-2" />
                Quản lý đơn hàng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Quản lý khách hàng
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Xem báo cáo
              </Button>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sản phẩm bán chạy</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cà chua hữu cơ</p>
                    <p className="text-sm text-gray-500">156 đơn hàng</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+23%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Rau muống sạch</p>
                    <p className="text-sm text-gray-500">134 đơn hàng</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+18%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Táo đỏ tươi</p>
                    <p className="text-sm text-gray-500">98 đơn hàng</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">+12%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
