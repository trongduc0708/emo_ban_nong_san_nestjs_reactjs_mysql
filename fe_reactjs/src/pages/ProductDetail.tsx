import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ShoppingCart, Loader2 } from 'lucide-react'
import { useQuery } from 'react-query'
import { productApi } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addingToCart, setAddingToCart] = useState(false)
  
  const { addToCart } = useCart()

  const productId = useMemo(() => Number(id), [id])
  const { data, isLoading } = useQuery([
    'product', productId
  ], () => productApi.getProduct(productId).then(r => r.data), { enabled: !!productId })

  const product = data?.data
  const images: string[] = product?.images?.map((i: any) => i.imageUrl) || []
  const variants: any[] = product?.variants || []
  const displayPrice = variants[selectedVariant]?.price || 0
  const reviews = (product?.reviews || []).map((r: any) => ({
    id: r.id,
    user: r.user?.fullName || 'Khách',
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.createdAt || Date.now()).toLocaleDateString('vi-VN')
  }))

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      setAddingToCart(true)
      
      const variantId = variants[selectedVariant]?.id || null
      
      await addToCart(product.id, variantId, quantity)
      
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`, {
        duration: 3000,
        icon: '🛒',
      })
    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ hàng:', error)
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng', {
        duration: 4000,
      })
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading && (
        <div className="py-12 text-center text-gray-500">Đang tải sản phẩm...</div>
      )}
      {!product && !isLoading && (
        <div className="py-12 text-center text-gray-500">Không tìm thấy sản phẩm</div>
      )}
      {product && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={images[0] || 'https://picsum.photos/seed/emo/800/600'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="text-gray-600">
                {(product.avgRating ?? 5).toFixed(1)} ({product.reviews?.length || 0} đánh giá)
              </span>
            </div>
            <p className="text-gray-600">
              Xuất xứ: {product.origin || '—'}
            </p>
          </div>

          {/* Variants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Chọn khối lượng:
            </h3>
            <div className="flex space-x-2">
              {variants.map((variant: any, index: number) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(index)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedVariant === index
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {variant.variantName}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-green-600">
            {Number(displayPrice).toLocaleString('vi-VN')}₫
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Số lượng:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                -
              </button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-16 text-center"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button 
              size="lg" 
              className="flex-1 flex items-center justify-center space-x-2"
              onClick={handleAddToCart}
              disabled={addingToCart}
            >
              {addingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Thêm vào giỏ hàng</span>
                </>
              )}
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Truck className="w-5 h-5 text-green-500" />
              <span>Giao hàng nhanh</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>An toàn tuyệt đối</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RotateCcw className="w-5 h-5 text-green-500" />
              <span>Đổi trả dễ dàng</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'description', name: 'Mô tả' },
              { id: 'features', name: 'Đặc điểm' },
              { id: 'reviews', name: 'Đánh giá' }
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

        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {product?.description || '—'}
              </p>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(product?.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {review.user}
                      </span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'fill-current' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
