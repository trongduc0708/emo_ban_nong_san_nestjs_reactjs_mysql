import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star, Heart, Share2, Truck, Shield, RotateCcw, ShoppingCart, Loader2, X } from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { productApi } from '@/services/api'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const productId = useMemo(() => Number(id), [id])
  const { data, isLoading } = useQuery([
    'product', productId
  ], () => productApi.getProduct(productId).then(r => r.data), { enabled: !!productId })

  const product = data?.data
  const images: string[] = product?.images?.map((i: any) => i.imageUrl) || []
  const variants: any[] = product?.variants || []
  const displayPrice = variants[selectedVariant]?.price || 0

  // Reset selected image khi product thay đổi
  React.useEffect(() => {
    if (images.length > 0) {
      setSelectedImageIndex(0)
    }
  }, [product?.id])

  const currentImage = images[selectedImageIndex] || images[0] || '/uploads/products/placeholder.jpg'
  const reviews = useMemo(() => {
    if (!product?.reviews || !Array.isArray(product.reviews)) {
      return []
    }
    try {
      return product.reviews.map((r: any) => {
        let dateStr = 'Chưa có ngày'
        try {
          if (r.createdAt) {
            const date = typeof r.createdAt === 'string' ? new Date(r.createdAt) : r.createdAt
            if (date instanceof Date && !isNaN(date.getTime())) {
              dateStr = date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            }
          }
        } catch (dateError) {
          console.error('Error parsing date:', dateError)
        }
        
        return {
          id: r.id || Math.random(),
          userId: r.userId ? Number(r.userId) : null,
          user: r.user?.fullName || 'Khách',
          rating: r.rating || 0,
          comment: r.comment || '',
          date: dateStr
        }
      })
    } catch (error) {
      console.error('Error mapping reviews:', error)
      return []
    }
  }, [product?.reviews])

  // Kiểm tra user đã đánh giá chưa
  const userReview = useMemo(() => {
    if (!user || !reviews.length) return null
    return reviews.find((r: any) => r.userId === user.id) || null
  }, [user, reviews])

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      return
    }

    if (reviewRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    try {
      setSubmittingReview(true)
      await productApi.createReview(productId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      })
      
      toast.success('Đánh giá đã được gửi và đang chờ phê duyệt')
      setReviewRating(0)
      setReviewComment('')
      
      // Refresh product data
      queryClient.invalidateQueries(['product', productId])
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    console.log('🔍 ProductDetail handleWishlistToggle called for product:', product?.id)
    console.log('🔍 isInWishlist:', isInWishlist(product?.id))
    
    if (!product) return
    
    try {
      if (isInWishlist(product.id)) {
        console.log('📤 Removing from wishlist...')
        await removeFromWishlist(product.id)
        toast.success('Đã xóa khỏi danh sách yêu thích!')
      } else {
        console.log('📤 Adding to wishlist...')
        await addToWishlist(product.id)
        toast.success('Đã thêm vào danh sách yêu thích!')
      }
    } catch (error: any) {
      console.error('❌ Error in handleWishlistToggle:', error)
      toast.error(error.message || 'Có lỗi xảy ra')
    }
  }

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
          <div className="aspect-w-16 aspect-h-12 relative">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Ảnh trước"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label="Ảnh sau"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-full h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-green-500 ring-2 ring-green-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Image Modal/Lightbox */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-8 h-8" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  aria-label="Ảnh trước"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
                  aria-label="Ảnh sau"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <img
              src={currentImage}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImageIndex === index ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                    aria-label={`Xem ảnh ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

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
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleWishlistToggle}
              className={`${
                isInWishlist(product?.id) 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product?.id) ? 'fill-current' : ''}`} />
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
              {/* Form đánh giá */}
              {user && !userReview && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Viết đánh giá</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn *
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewRating(rating)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                rating <= reviewRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét (tùy chọn)
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || reviewRating === 0}
                      className="w-full"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi đánh giá'
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {user && userReview && (
                <Card className="p-4 bg-green-50 border-green-200">
                  <p className="text-green-700">
                    ✓ Bạn đã đánh giá sản phẩm này. Mỗi khách hàng chỉ được đánh giá 1 lần cho mỗi sản phẩm.
                  </p>
                </Card>
              )}

              {!user && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <p className="text-blue-700">
                    Vui lòng đăng nhập và mua sản phẩm (đơn hàng đã hoàn thành) để có thể đánh giá.
                  </p>
                </Card>
              )}

              {/* Danh sách đánh giá */}
              {!product ? (
                <div className="text-center text-gray-500 py-8">
                  Đang tải đánh giá...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Chưa có đánh giá nào cho sản phẩm này.
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Đánh giá từ khách hàng ({reviews.length})</h4>
                  {reviews.map((review: any) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {review.user || 'Khách'}
                          </span>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (review.rating || 0) ? 'fill-current' : ''
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
