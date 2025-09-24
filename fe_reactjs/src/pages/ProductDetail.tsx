import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // Mock data - sẽ thay thế bằng API call
  const product = {
    id: 1,
    name: 'Cà chua hữu cơ',
    price: 25000,
    images: [
      'https://images.unsplash.com/photo-1592924357228-91b4b4c8c5b8?w=600',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'
    ],
    variants: [
      { id: 1, name: '500g', price: 25000 },
      { id: 2, name: '1kg', price: 45000 },
      { id: 3, name: '2kg', price: 80000 }
    ],
    rating: 4.8,
    reviews: 124,
    description: 'Cà chua hữu cơ được trồng theo phương pháp tự nhiên, không sử dụng hóa chất độc hại. Sản phẩm có vị ngọt tự nhiên, giàu vitamin và khoáng chất.',
    features: [
      '100% hữu cơ',
      'Không sử dụng thuốc trừ sâu',
      'Tươi ngon, giàu dinh dưỡng',
      'Đóng gói an toàn'
    ],
    origin: 'Đà Lạt, Lâm Đồng'
  }

  const reviews = [
    {
      id: 1,
      user: 'Chị Minh Anh',
      rating: 5,
      comment: 'Cà chua rất ngon và tươi, tôi sẽ mua lại.',
      date: '2024-01-15'
    },
    {
      id: 2,
      user: 'Anh Văn Đức',
      rating: 4,
      comment: 'Chất lượng tốt, giao hàng nhanh.',
      date: '2024-01-14'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-12">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((image, index) => (
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
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>
            <p className="text-gray-600">
              Xuất xứ: {product.origin}
            </p>
          </div>

          {/* Variants */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Chọn khối lượng:
            </h3>
            <div className="flex space-x-2">
              {product.variants.map((variant, index) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(index)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedVariant === index
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-green-600">
            {product.variants[selectedVariant].price.toLocaleString('vi-VN')}₫
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
            <Button size="lg" className="flex-1">
              Thêm vào giỏ hàng
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
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews.map((review) => (
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
