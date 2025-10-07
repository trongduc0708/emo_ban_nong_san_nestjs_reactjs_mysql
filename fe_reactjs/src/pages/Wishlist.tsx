import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist()
  const { addToCart } = useCart()

  const wishlistProducts = wishlistItems
  
  console.log('🔍 Wishlist page - wishlistItems:', wishlistItems)
  console.log('🔍 Wishlist page - wishlistProducts:', wishlistProducts)
  if (wishlistProducts.length > 0) {
    console.log('🔍 Wishlist page - first product:', wishlistProducts[0])
    console.log('🔍 Wishlist page - first product name:', wishlistProducts[0].product?.name)
    console.log('🔍 Wishlist page - first product variants:', wishlistProducts[0].product?.variants)
  }

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id, product.variants?.[0]?.id || null, 1)
      toast.success('Đã thêm vào giỏ hàng!')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng')
    }
  }

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await removeFromWishlist(productId)
      toast.success('Đã xóa khỏi danh sách yêu thích!')
    } catch (error: any) {
      toast.error('Có lỗi xảy ra khi xóa khỏi danh sách yêu thích')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    )
  }

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Danh sách yêu thích trống
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong danh sách yêu thích
          </p>
          <Link to="/products">
            <Button size="lg">
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Danh sách yêu thích
        </h1>
        <p className="text-gray-600">
          {wishlistProducts.length} sản phẩm trong danh sách yêu thích
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistProducts.map((item: any) => {
          const product = item.product
          return (
          <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
            <div className="aspect-w-16 aspect-h-12 mb-4">
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.images?.[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </Link>
            </div>
            
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <div className="flex-1">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors group-hover:text-green-600">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">{product.category?.name}</p>
                
                <div className="flex items-center space-x-1 mt-2">
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
                  <span className="text-lg font-bold text-green-600">
                    {(product.variants?.[0]?.price ?? 0).toLocaleString('vi-VN')}₫
                  </span>
                  {product.variants?.[0]?.compareAtPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {product.variants[0].compareAtPrice.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
                
                {product.variants?.[0] && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {product.variants[0].variantName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center space-x-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Thêm</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
          )
        })}
      </div>
    </div>
  )
}
