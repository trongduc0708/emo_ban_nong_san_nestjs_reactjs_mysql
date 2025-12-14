import React from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Package, DollarSign, TrendingUp, Plus, Eye, Shield, Loader2 } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { adminApi } from '@/services/api'

interface RecentOrder {
  id: number
  customer: string
  total: number
  status: string
  date: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  // Fetch dashboard stats from API
  const { data: dashboardData, isLoading, error } = useQuery(
    ['admin-dashboard'],
    () => adminApi.getDashboardStats().then(res => res.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  )

  // Prepare stats array from API data
  const stats = React.useMemo(() => {
    if (!dashboardData?.stats) return []
    return [
      {
        title: 'Tổng đơn hàng',
        value: dashboardData.stats.totalOrders.value,
        change: dashboardData.stats.totalOrders.change,
        changeType: dashboardData.stats.totalOrders.changeType,
        icon: Package
      },
      {
        title: 'Doanh thu',
        value: dashboardData.stats.totalRevenue.value,
        change: dashboardData.stats.totalRevenue.change,
        changeType: dashboardData.stats.totalRevenue.changeType,
        icon: DollarSign
      },
      {
        title: 'Khách hàng',
        value: dashboardData.stats.totalUsers.value,
        change: dashboardData.stats.totalUsers.change,
        changeType: dashboardData.stats.totalUsers.changeType,
        icon: Users
      },
      {
        title: 'Tăng trưởng',
        value: dashboardData.stats.growth.value,
        change: dashboardData.stats.growth.change,
        changeType: dashboardData.stats.growth.changeType,
        icon: TrendingUp
      }
    ]
  }, [dashboardData])

  const recentOrders: RecentOrder[] = dashboardData?.recentOrders || []

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

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">
              Tổng quan về hoạt động kinh doanh
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Admin Access</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-4 flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : error ? (
          <div className="col-span-4 text-center py-12 text-red-600">
            Có lỗi xảy ra khi tải dữ liệu
          </div>
        ) : (
          stats.map((stat, index) => (
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
          ))
        )}
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
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có đơn hàng nào
                </div>
              ) : (
                recentOrders.map((order: RecentOrder) => (
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
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thao tác nhanh</h2>
            
            <div className="space-y-4">
              <Button className="w-full justify-start" onClick={() => navigate('/admin/products')}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm mới
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/orders')}>
                <Package className="w-4 h-4 mr-2" />
                Quản lý đơn hàng
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/users')}>
                <Users className="w-4 h-4 mr-2" />
                Quản lý khách hàng
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/reports')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Xem báo cáo
              </Button>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Sản phẩm bán chạy</h2>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                </div>
              ) : !dashboardData?.topProducts || dashboardData.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu
                </div>
              ) : (
                dashboardData.topProducts.map((product: any, index: number) => {
                  const colorClasses = [
                    { bg: 'bg-green-100', text: 'text-green-600' },
                    { bg: 'bg-blue-100', text: 'text-blue-600' },
                    { bg: 'bg-purple-100', text: 'text-purple-600' }
                  ]
                  const colorClass = colorClasses[index % colorClasses.length]
                  return (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${colorClass.bg} rounded-full flex items-center justify-center`}>
                          <span className={`${colorClass.text} font-semibold text-sm`}>{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.orderCount} đơn hàng</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}
