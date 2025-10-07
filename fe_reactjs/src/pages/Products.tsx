import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Filter, Grid, List, ShoppingCart, Loader2 } from 'lucide-react'
import { useQuery } from 'react-query'
import { productApi } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function Products() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)
  
  const { addToCart } = useCart()

  // Load categories from API
  const { data: categoriesResp } = useQuery(['categories'], () => productApi.getCategories().then(r => r.data))
  const categories = useMemo(() => {
    const list = categoriesResp?.data || []
    return [{ id: '', name: 'Tất cả', slug: '' }, ...list.map((c: any) => ({ id: String(c.id), name: c.name, slug: c.slug }))]
  }, [categoriesResp])

  // Load products from API
  const { data: productsResp, isLoading } = useQuery([
    'products', selectedCategory, searchTerm, currentPage
  ], () => productApi.getProducts({
    page: currentPage,
    limit: 12,
    category: selectedCategory || undefined,
    search: searchTerm || undefined,
  }).then(r => r.data), {
    keepPreviousData: true,
  })
  const products = productsResp?.data?.products || []
  const pagination = productsResp?.data?.pagination || { totalPages: 1, currentPage: 1, totalItems: 0 }

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Handle add to cart
  const handleAddToCart = async (product: any) => {
    try {
      setAddingToCart(product.id)
      
      // Get the first variant or null if no variants
      const variantId = product.variants?.[0]?.id || null
      
      await addToCart(product.id, variantId, 1)
      
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, {
        duration: 3000,
        icon: '🛒',
      })
    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ hàng:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng', {
        duration: 4000,
      })
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sản Phẩm</h1>
        <p className="text-lg text-gray-600">
          Khám phá đa dạng các loại nông sản tươi ngon
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>

          {/* Category Filter */}
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map((category) => (
                <option key={category.slug ?? category.id} value={category.slug ?? ''}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading && (
        <div className="py-12 text-center text-gray-500">Đang tải sản phẩm...</div>
      )}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {products.map((product: any) => (
          <Card key={product.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
            {viewMode === 'grid' ? (
              // Grid View
              <>
                <div className="aspect-w-16 aspect-h-12 mb-4">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.images?.[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </Link>
                </div>
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex-1">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-sm">★</span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {(product.avgRating ?? 5).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">
                        {(product.variants?.[0]?.price ?? 0).toLocaleString('vi-VN')}₫
                      </span>
                      {product.variants?.[0]?.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.variants[0].compareAtPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    {product.variants?.[0] && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {product.variants[0].variantName}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                          disabled={addingToCart === product.id}
                          className="flex items-center space-x-2"
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang thêm...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              <span>Thêm</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // List View
              <div className="flex gap-4">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images?.[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                    alt={product.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </Link>
                <div className="flex-1 space-y-2">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-500">{product.category?.name}</p>
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {(product.avgRating ?? 5).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      {(product.variants?.[0]?.price ?? 0).toLocaleString('vi-VN')}₫
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                      className="flex items-center space-x-2"
                    >
                      {addingToCart === product.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Đang thêm...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Thêm vào giỏ</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Trước
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current page
              const shouldShow = 
                page === 1 || 
                page === pagination.totalPages || 
                Math.abs(page - currentPage) <= 1
              
              if (!shouldShow) {
                // Show ellipsis for gaps
                if (page === 2 && currentPage > 4) {
                  return <span key={`ellipsis-${page}`} className="px-2 text-gray-500">...</span>
                }
                if (page === pagination.totalPages - 1 && currentPage < pagination.totalPages - 3) {
                  return <span key={`ellipsis-${page}`} className="px-2 text-gray-500">...</span>
                }
                return null
              }
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === pagination.totalPages}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === pagination.totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Sau
            </button>
          </nav>
          
          {/* Pagination info */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Trang {currentPage} / {pagination.totalPages} - Tổng {pagination.totalItems} sản phẩm
          </div>
        </div>
      )}
    </div>
  )
}
