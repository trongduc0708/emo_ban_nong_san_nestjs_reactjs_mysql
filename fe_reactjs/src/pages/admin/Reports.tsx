import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  Loader2,
  Calendar,
  Download,
  AlertTriangle,
  Box,
  Warehouse,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { adminApi } from '@/services/api'
import { exportToCSV, formatCurrencyForExport } from '@/utils/exportUtils'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales')
  const [lowStockThreshold, setLowStockThreshold] = useState(50)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const { data: reportsData, isLoading, error } = useQuery(
    ['admin-reports', startDate, endDate, period],
    () => adminApi.getReports({
      startDate,
      endDate,
      period
    }).then(res => res.data),
    { keepPreviousData: true, enabled: activeTab === 'sales' }
  )

  const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useQuery(
    ['admin-inventory-report', lowStockThreshold],
    () => adminApi.getInventoryReport({
      lowStockThreshold
    }).then(res => res.data),
    { keepPreviousData: true, enabled: activeTab === 'inventory' }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Export functions
  const handleExportSalesReport = () => {
    if (!reportsData) {
      toast.error('Chưa có dữ liệu để xuất báo cáo')
      return
    }

    const reportSummary = reportsData.summary || {
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      averageOrderValue: 0
    }

    try {
      // Export summary
      const summaryData = [{
        'Tiêu chí': 'Tổng doanh thu',
        'Giá trị': formatCurrencyForExport(reportSummary.totalRevenue)
      }, {
        'Tiêu chí': 'Tổng đơn hàng',
        'Giá trị': reportSummary.totalOrders.toString()
      }, {
        'Tiêu chí': 'Đơn hoàn thành',
        'Giá trị': reportSummary.completedOrders.toString()
      }, {
        'Tiêu chí': 'Giá trị TB/đơn',
        'Giá trị': formatCurrencyForExport(reportSummary.averageOrderValue)
      }]

      exportToCSV(summaryData, 'Bao_cao_Tong_quan', ['Tiêu chí', 'Giá trị'])

      // Export orders by status
      if (reportsData.ordersByStatus && reportsData.ordersByStatus.length > 0) {
        setTimeout(() => {
          const statusData = reportsData.ordersByStatus.map((item: any) => ({
            'Trạng thái': getStatusText(item.status),
            'Số đơn': item.count.toString(),
            'Doanh thu': formatCurrencyForExport(item.revenue)
          }))
          exportToCSV(statusData, 'Bao_cao_Don_hang_theo_trang_thai', ['Trạng thái', 'Số đơn', 'Doanh thu'])
        }, 500)
      }

      // Export top products
      if (reportsData.topProducts && reportsData.topProducts.length > 0) {
        setTimeout(() => {
          const productsData = reportsData.topProducts.map((product: any) => ({
            'Sản phẩm': product.name,
            'Số lượng': product.quantity.toString(),
            'Số đơn': product.orderCount.toString(),
            'Doanh thu': formatCurrencyForExport(product.revenue)
          }))
          exportToCSV(productsData, 'Bao_cao_San_pham_ban_chay', ['Sản phẩm', 'Số lượng', 'Số đơn', 'Doanh thu'])
        }, 1000)
      }

      // Export top customers
      if (reportsData.topCustomers && reportsData.topCustomers.length > 0) {
        setTimeout(() => {
          const customersData = reportsData.topCustomers.map((customer: any) => ({
            'Khách hàng': customer.name,
            'Email': customer.email,
            'Số đơn': customer.orderCount.toString(),
            'Tổng chi tiêu': formatCurrencyForExport(customer.totalSpent)
          }))
          exportToCSV(customersData, 'Bao_cao_Khach_hang', ['Khách hàng', 'Email', 'Số đơn', 'Tổng chi tiêu'])
        }, 1500)
      }

      toast.success('Đã xuất báo cáo bán hàng thành công')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Lỗi khi xuất báo cáo')
    }
  }

  const handleExportInventoryReport = () => {
    if (!inventoryData) {
      toast.error('Chưa có dữ liệu để xuất báo cáo')
      return
    }

    try {
      // Export summary
      const summaryData = [{
        'Tiêu chí': 'Tổng biến thể',
        'Giá trị': inventoryData.summary.totalVariants.toString()
      }, {
        'Tiêu chí': 'Còn hàng',
        'Giá trị': inventoryData.summary.inStock.toString()
      }, {
        'Tiêu chí': 'Hết hàng',
        'Giá trị': inventoryData.summary.outOfStock.toString()
      }, {
        'Tiêu chí': 'Sắp hết',
        'Giá trị': inventoryData.summary.lowStock.toString()
      }, {
        'Tiêu chí': 'Tổng số lượng',
        'Giá trị': inventoryData.summary.totalQuantity.toString()
      }, {
        'Tiêu chí': 'Tổng giá trị',
        'Giá trị': formatCurrencyForExport(inventoryData.summary.totalInventoryValue)
      }]

      exportToCSV(summaryData, 'Bao_cao_Ton_kho_Tong_quan', ['Tiêu chí', 'Giá trị'])

      // Export out of stock
      if (inventoryData.outOfStockVariants && inventoryData.outOfStockVariants.length > 0) {
        setTimeout(() => {
          const outOfStockData = inventoryData.outOfStockVariants.map((variant: any) => ({
            'Sản phẩm': variant.productName,
            'Biến thể': variant.variantName,
            'Đơn vị': variant.unitLabel || '',
            'Danh mục': variant.categoryName,
            'Số lượng': '0',
            'Đơn giá': formatCurrencyForExport(variant.price)
          }))
          exportToCSV(outOfStockData, 'Bao_cao_Het_hang', ['Sản phẩm', 'Biến thể', 'Đơn vị', 'Danh mục', 'Số lượng', 'Đơn giá'])
        }, 500)
      }

      // Export low stock
      if (inventoryData.lowStockVariants && inventoryData.lowStockVariants.length > 0) {
        setTimeout(() => {
          const lowStockData = inventoryData.lowStockVariants.map((variant: any) => ({
            'Sản phẩm': variant.productName,
            'Biến thể': variant.variantName,
            'Đơn vị': variant.unitLabel || '',
            'Danh mục': variant.categoryName,
            'Số lượng': variant.stockQuantity.toString(),
            'Đơn giá': formatCurrencyForExport(variant.price)
          }))
          exportToCSV(lowStockData, 'Bao_cao_Sap_het_hang', ['Sản phẩm', 'Biến thể', 'Đơn vị', 'Danh mục', 'Số lượng', 'Đơn giá'])
        }, 1000)
      }

      // Export top stock
      if (inventoryData.topStockVariants && inventoryData.topStockVariants.length > 0) {
        setTimeout(() => {
          const topStockData = inventoryData.topStockVariants.map((variant: any) => ({
            'Sản phẩm': variant.productName,
            'Biến thể': variant.variantName,
            'Đơn vị': variant.unitLabel || '',
            'Danh mục': variant.categoryName,
            'Số lượng': variant.stockQuantity.toString(),
            'Đơn giá': formatCurrencyForExport(variant.price),
            'Giá trị tồn kho': formatCurrencyForExport(variant.inventoryValue)
          }))
          exportToCSV(topStockData, 'Bao_cao_Ton_kho_Nhieu_nhat', ['Sản phẩm', 'Biến thể', 'Đơn vị', 'Danh mục', 'Số lượng', 'Đơn giá', 'Giá trị tồn kho'])
        }, 1500)
      }

      // Export by category
      if (inventoryData.inventoryByCategory && inventoryData.inventoryByCategory.length > 0) {
        setTimeout(() => {
          const categoryData = inventoryData.inventoryByCategory.map((item: any) => ({
            'Danh mục': item.category,
            'Số biến thể': item.variantCount.toString(),
            'Tổng số lượng': item.quantity.toString(),
            'Giá trị tồn kho': formatCurrencyForExport(item.value)
          }))
          exportToCSV(categoryData, 'Bao_cao_Ton_kho_theo_Danh_muc', ['Danh mục', 'Số biến thể', 'Tổng số lượng', 'Giá trị tồn kho'])
        }, 2000)
      }

      toast.success('Đã xuất báo cáo tồn kho thành công')
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Lỗi khi xuất báo cáo')
    }
  }

  const handleExportReport = () => {
    if (activeTab === 'sales') {
      handleExportSalesReport()
    } else {
      handleExportInventoryReport()
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PREPARING': 'Đang chuẩn bị',
      'SHIPPING': 'Đang giao',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'COMPLETED': 'bg-green-100 text-green-700',
      'SHIPPING': 'bg-blue-100 text-blue-700',
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'REFUNDED': 'bg-gray-100 text-gray-700'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 text-red-600">
            Có lỗi xảy ra khi tải báo cáo
          </div>
        </div>
      </AdminLayout>
    )
  }

  const summary = reportsData?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo & Thống kê</h1>
              <p className="text-gray-600">Phân tích chi tiết về hoạt động kinh doanh và tồn kho</p>
            </div>
            <div className="relative">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      {activeTab === 'sales' ? (
                        <button
                          onClick={handleExportSalesReport}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Xuất báo cáo bán hàng (CSV)</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleExportInventoryReport}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Xuất báo cáo tồn kho (CSV)</span>
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={() => {
                          setShowExportMenu(false)
                          toast('Tính năng xuất Excel đang được phát triển', { icon: 'ℹ️' })
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Xuất Excel (Sắp có)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Báo cáo Bán hàng
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Warehouse className="w-5 h-5 inline mr-2" />
              Báo cáo Tồn kho
            </button>
          </nav>
        </div>

        {/* Sales Report Tab */}
        {activeTab === 'sales' && (
          <>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chu kỳ
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => window.location.reload()}>
                <Calendar className="w-4 h-4 mr-2" />
                Áp dụng
              </Button>
            </div>
          </div>
          {reportsData?.period && (
            <div className="mt-4 text-sm text-gray-600">
              Báo cáo từ {formatDate(reportsData.period.start)} đến {formatDate(reportsData.period.end)}
            </div>
          )}
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đơn hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{summary.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Giá trị TB/đơn</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.averageOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Orders by Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Đơn hàng theo trạng thái</h2>
            <div className="space-y-4">
              {reportsData?.ordersByStatus?.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{item.count} đơn</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Sales by Category */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Doanh thu theo danh mục</h2>
            <div className="space-y-4">
              {reportsData?.salesByCategory?.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.category}</p>
                    <p className="text-sm text-gray-500">{item.orderCount} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(item.revenue)}</p>
                    <p className="text-sm text-gray-500">{item.quantity} sản phẩm</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 10 Sản phẩm bán chạy</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportsData?.topProducts?.map((product: any) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{product.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{product.orderCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 10 Khách hàng</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportsData?.topCustomers?.map((customer: any) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {customer.avatarUrl ? (
                          <img
                            src={customer.avatarUrl}
                            alt={customer.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{customer.orderCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
          </>
        )}

        {/* Inventory Report Tab */}
        {activeTab === 'inventory' && (
          <>
            {/* Filters */}
            <Card className="p-6 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Ngưỡng cảnh báo tồn kho thấp:
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 50)}
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-32"
                />
                <span className="text-sm text-gray-500">sản phẩm</span>
              </div>
            </Card>

            {inventoryLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : inventoryError ? (
              <div className="text-center py-12 text-red-600">
                Có lỗi xảy ra khi tải báo cáo tồn kho
              </div>
            ) : inventoryData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tổng biến thể</p>
                        <p className="text-2xl font-bold text-gray-900">{inventoryData.summary.totalVariants}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Còn hàng</p>
                        <p className="text-2xl font-bold text-green-600">{inventoryData.summary.inStock}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Box className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                        <p className="text-2xl font-bold text-red-600">{inventoryData.summary.outOfStock}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sắp hết</p>
                        <p className="text-2xl font-bold text-yellow-600">{inventoryData.summary.lowStock}</p>
                        <p className="text-xs text-gray-500 mt-1">(≤ {inventoryData.summary.lowStockThreshold})</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Tổng số lượng</h2>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{inventoryData.summary.totalQuantity.toLocaleString('vi-VN')}</p>
                    <p className="text-sm text-gray-500 mt-2">sản phẩm</p>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Tổng giá trị</h2>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(inventoryData.summary.totalInventoryValue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">tồn kho</p>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Out of Stock */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Sản phẩm hết hàng ({inventoryData.outOfStockVariants.length})</h2>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {inventoryData.outOfStockVariants.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Không có sản phẩm hết hàng</p>
                      ) : (
                        inventoryData.outOfStockVariants.map((variant: any) => (
                          <div key={variant.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              {variant.imageUrl && (
                                <img src={variant.imageUrl} alt={variant.productName} className="w-12 h-12 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{variant.productName}</p>
                                <p className="text-sm text-gray-500">{variant.variantName} {variant.unitLabel && `(${variant.unitLabel})`}</p>
                                <p className="text-xs text-gray-400">{variant.categoryName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-red-600">0</p>
                              <p className="text-xs text-gray-500">{formatCurrency(variant.price)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  {/* Low Stock */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Sản phẩm sắp hết ({inventoryData.lowStockVariants.length})</h2>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {inventoryData.lowStockVariants.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Không có sản phẩm sắp hết hàng</p>
                      ) : (
                        inventoryData.lowStockVariants.map((variant: any) => (
                          <div key={variant.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              {variant.imageUrl && (
                                <img src={variant.imageUrl} alt={variant.productName} className="w-12 h-12 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{variant.productName}</p>
                                <p className="text-sm text-gray-500">{variant.variantName} {variant.unitLabel && `(${variant.unitLabel})`}</p>
                                <p className="text-xs text-gray-400">{variant.categoryName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-yellow-600">{variant.stockQuantity}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(variant.price)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* Top Stock Variants */}
                <Card className="p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Top 10 Sản phẩm tồn kho nhiều nhất</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị tồn kho</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryData.topStockVariants.map((variant: any) => (
                          <tr key={variant.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {variant.imageUrl && (
                                  <img src={variant.imageUrl} alt={variant.productName} className="w-10 h-10 rounded object-cover mr-3" />
                                )}
                                <div>
                                  <span className="font-medium text-gray-900">{variant.productName}</span>
                                  <p className="text-sm text-gray-500">{variant.variantName} {variant.unitLabel && `(${variant.unitLabel})`}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{variant.categoryName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{variant.stockQuantity.toLocaleString('vi-VN')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{formatCurrency(variant.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                              {formatCurrency(variant.inventoryValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Inventory by Category */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Tồn kho theo danh mục</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số biến thể</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng số lượng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị tồn kho</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryData.inventoryByCategory.map((item: any) => (
                          <tr key={item.category}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.variantCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.quantity.toLocaleString('vi-VN')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                              {formatCurrency(item.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : null}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

