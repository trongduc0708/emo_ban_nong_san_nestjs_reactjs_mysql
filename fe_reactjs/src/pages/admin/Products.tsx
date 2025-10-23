import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Package,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'
import { adminApi } from '@/services/api'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description: string
  origin: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  category: { 
    id: number
    name: string
    slug: string
  }
  variants: { 
    id: number
    variantName: string
    unitLabel: string
    price: number
    compareAtPrice: number
    stockQuantity: number
    isActive: boolean
  }[]
  images: { 
    id: number
    imageUrl: string
    position: number
  }[]
  _count: { 
    orderItems: number
    variants: number
    images: number
  }
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  /**
   * Tải danh sách sản phẩm từ API với phân trang, tìm kiếm và lọc
   * Hỗ trợ fallback sang mock data khi API lỗi
   */
  const loadProducts = async () => {
    try {
      setLoading(true)
      console.log('Attempting to load products from API...')
      
      const response = await adminApi.getProducts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      
      console.log('API Response received')
      
      // If no products from API, use mock data
      if (!response.data.products || response.data.products.length === 0) {
        console.log('No products from API, using mock data')
        const mockProducts = [
          {
            id: 1,
            name: 'Rau Muống Tươi',
            slug: 'rau-muong-tuoi',
            sku: 'RM001',
            description: 'Rau muống tươi ngon, giòn ngọt',
            origin: 'Đồng bằng sông Cửu Long',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: { id: 1, name: 'Rau Củ', slug: 'rau-cu' },
            variants: [
              {
                id: 1,
                variantName: 'Gói 500g',
                unitLabel: 'gói',
                price: 15000,
                compareAtPrice: 20000,
                stockQuantity: 100,
                isActive: true
              }
            ],
            images: [
              {
                id: 1,
                imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                position: 1
              }
            ],
            _count: { orderItems: 5, variants: 1, images: 1 }
          }
        ]
        setProducts(mockProducts)
        setPagination({ page: 1, limit: 10, total: 1, pages: 1 })
      } else {
        setProducts(response.data.products)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      console.log('API Error - using mock data as fallback')
      toast.error('Lỗi khi tải danh sách sản phẩm - Sử dụng dữ liệu mẫu')
      
      // Fallback to mock data on error
      const mockProducts = [
        {
          id: 1,
          name: 'Rau Muống Tươi',
          slug: 'rau-muong-tuoi',
          sku: 'RM001',
          description: 'Rau muống tươi ngon, giòn ngọt',
          origin: 'Đồng bằng sông Cửu Long',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          category: { id: 1, name: 'Rau Củ', slug: 'rau-cu' },
          variants: [
            {
              id: 1,
              variantName: 'Gói 500g',
              unitLabel: 'gói',
              price: 15000,
              compareAtPrice: 20000,
              stockQuantity: 100,
              isActive: true
            }
          ],
          images: [
            {
              id: 1,
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
              position: 1
            }
          ],
          _count: { orderItems: 5, variants: 1, images: 1 }
        }
      ]
      setProducts(mockProducts)
      setPagination({ page: 1, limit: 10, total: 1, pages: 1 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Test with mock data first
    console.log('Loading products...')
    loadProducts()
  }, [pagination.page, searchTerm, filterStatus])

  /**
   * Xóa sản phẩm với xác nhận từ người dùng
   * @param id - ID của sản phẩm cần xóa
   */
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await adminApi.deleteProduct(id)
        toast.success('Xóa sản phẩm thành công')
        loadProducts()
      } catch (error) {
        toast.error('Lỗi khi xóa sản phẩm')
        console.error('Error deleting product:', error)
      }
    }
  }

  /**
   * Mở form thêm sản phẩm mới
   */
  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  /**
   * Mở form chỉnh sửa sản phẩm
   * @param product - Sản phẩm cần chỉnh sửa
   */
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  /**
   * Đóng form sản phẩm và reset state
   */
  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  /**
   * Xử lý khi form lưu thành công - reload danh sách sản phẩm
   */
  const handleFormSuccess = () => {
    loadProducts()
  }

  /**
   * Lấy màu sắc cho trạng thái sản phẩm
   * @param isActive - Trạng thái hoạt động của sản phẩm
   * @returns CSS classes cho màu sắc
   */
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100'
  }

  /**
   * Lấy text hiển thị cho trạng thái sản phẩm
   * @param isActive - Trạng thái hoạt động của sản phẩm
   * @returns Text hiển thị
   */
  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Đang bán' : 'Ngừng bán'
  }

  /**
   * Tính giá sản phẩm từ danh sách variants
   * Lấy giá thấp nhất từ các variants
   * @param variants - Danh sách variants của sản phẩm
   * @returns Giá sản phẩm (số)
   */
  const getProductPrice = (variants: any[]) => {
    if (!variants || variants.length === 0) {
      return 0
    }
    
    // Handle both string and number prices
    const prices = variants.map(v => {
      let price = 0
      
      if (typeof v.price === 'number') {
        price = v.price
      } else if (typeof v.price === 'string') {
        price = parseFloat(v.price) || 0
      } else if (v.price !== null && v.price !== undefined) {
        price = Number(v.price) || 0
      }
      
      return price
    }).filter(p => p > 0)
    
    if (prices.length === 0) return 0
    return Math.min(...prices)
  }

  /**
   * Hiển thị giá sản phẩm với logic đặc biệt:
   * - Nếu có nhiều variants: hiển thị "Nhiều mức giá"
   * - Nếu có 1 variant: hiển thị giá cụ thể
   * - Nếu không có variant: hiển thị "Chưa có giá"
   * @param product - Sản phẩm cần hiển thị giá
   * @returns Text hiển thị giá
   */
  const displayPrice = (product: any) => {
    try {
      if (!product.variants || product.variants.length === 0) {
        return 'Chưa có giá'
      }
      
      // If multiple variants, hide price column
      if (product.variants.length > 1) {
        return 'Nhiều mức giá'
      }
      
      // Single variant - show price
      const variant = product.variants[0]
      if (variant && variant.price !== undefined && variant.price !== null) {
        let price = 0
        
        if (typeof variant.price === 'number') {
          price = variant.price
        } else if (typeof variant.price === 'string') {
          price = parseFloat(variant.price) || 0
        } else if (typeof variant.price === 'object') {
          // Handle BigInt or other object types
          price = Number(variant.price) || 0
        }
        
        return price > 0 ? `${price.toLocaleString('vi-VN')}₫` : 'Giá không hợp lệ'
      }
      
      return 'Chưa có giá'
    } catch (error) {
      console.error('Error displaying price:', error)
      return 'Lỗi hiển thị giá'
    }
  }

  /**
   * Tính tổng số lượng tồn kho từ tất cả variants
   * @param variants - Danh sách variants của sản phẩm
   * @returns Tổng số lượng tồn kho
   */
  const getTotalStock = (variants: any[]) => {
    if (!variants || variants.length === 0) return 0
    return variants.reduce((sum, v) => sum + (parseInt(v.stockQuantity) || 0), 0)
  }

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
              <p className="text-lg text-gray-600">
                Quản lý danh mục sản phẩm và thông tin chi tiết
              </p>
            </div>
            <Button onClick={handleAddProduct} className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Thêm sản phẩm</span>
            </Button>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang bán</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, p) => sum + p._count.orderItems, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xuất xứ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh số
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={product.images[0].imageUrl} 
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'N/A'} | ID: #{product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.origin || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayPrice(product)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getTotalStock(product.variants)} sản phẩm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.isActive)}`}>
                          {getStatusText(product.isActive)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{product._count.orderItems} đơn</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Hiển thị {((pagination.page - 1) * pagination.limit) + 1} đến{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{' '}
                {pagination.total} sản phẩm
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

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </AdminLayout>
  )
}
