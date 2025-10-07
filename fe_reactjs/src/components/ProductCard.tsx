import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Star, ShoppingCart } from 'lucide-react'

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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id, mainVariant?.id || null)
    }
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-w-16 aspect-h-12 mb-4 overflow-hidden rounded-lg">
        <Link to={`/products/${product.id}`}>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
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
        <div className="flex items-center justify-between">
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
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Thêm
          </Button>
        </div>

        {/* Variant info */}
        {mainVariant && (
          <p className="text-xs text-gray-500">
            {mainVariant.variantName}
          </p>
        )}
      </div>
    </Card>
  )
}
