import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Array<any>
  categorySlug?: string
  onAddToCart?: (productId: number, variantId: number | null) => void
}

export default function ProductSection({ 
  title, 
  subtitle, 
  products, 
  categorySlug,
  onAddToCart 
}: ProductSectionProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
          
          {categorySlug && (
            <Link
              to={`/products?category=${encodeURIComponent(categorySlug)}`}
              className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Show more button for mobile */}
        {products.length > 5 && (
          <div className="mt-6 text-center lg:hidden">
            <Link
              to={categorySlug ? `/products?category=${encodeURIComponent(categorySlug)}` : '/products'}
              className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Xem thêm {products.length - 5} sản phẩm
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
