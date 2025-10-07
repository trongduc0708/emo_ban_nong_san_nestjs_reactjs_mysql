import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    images: Array<{ imageUrl: string }>
    variants: Array<{
      id: number
      variantName: string
      price: number
      compareAtPrice?: number
    }>
    category?: {
      id: number
      name: string
      slug: string
    }
    avgRating: number
    reviewCount: number
  }
  onAddToCart?: (productId: number, variantId: number | null) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const mainImage = product.images[0]?.imageUrl || '/uploads/products/placeholder.jpg'
  const mainVariant = product.variants[0]
  const price = mainVariant?.price || 0
  const comparePrice = mainVariant?.compareAtPrice
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, mainVariant?.id || null)
    }
  }

  const handleWishlistToggle = async () => {
    console.log('🔍 handleWishlistToggle called for product:', product.id)
    console.log('🔍 isInWishlist:', isInWishlist(product.id))
    console.log('🔍 localStorage token:', localStorage.getItem('token'))
    console.log('🔍 localStorage user:', localStorage.getItem('user'))
    
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

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      <div className="aspect-w-16 aspect-h-12 mb-4 overflow-hidden rounded-lg relative">
        <Link to={`/products/${product.id}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <Button
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            isInWishlist(product.id) 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-white hover:bg-gray-50 text-gray-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-green-600 transition-colors group-hover:text-green-600">
              {product.name}
            </h3>
          </Link>
          {product.category && (
            <p className="text-sm text-gray-500 mt-1">{product.category.name}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.avgRating)
                    ? 'fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {product.avgRating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              {price.toLocaleString('vi-VN')}₫
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-sm text-gray-500 line-through">
                {comparePrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>

        {/* Variant info and Button */}
        {mainVariant && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {mainVariant.variantName}
            </p>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
