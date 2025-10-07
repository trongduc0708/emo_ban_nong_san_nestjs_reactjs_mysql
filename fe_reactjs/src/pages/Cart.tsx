import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/utils/priceUtils'

export default function Cart() {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link to="/products">
            <Button size="lg">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Giỏ Hàng</h1>
        <p className="text-lg text-gray-600">
          Bạn có {totalItems} sản phẩm trong giỏ hàng
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex gap-4">
                <img
                  src={item.product.images[0]?.imageUrl || '/uploads/products/placeholder.jpg'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.product.name}
                  </h3>
                  {item.variant && (
                    <p className="text-sm text-gray-500 mb-2">
                      {item.variant.variantName}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(item.unitPriceSnapshot)}₫
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">
                  {Number(totalPrice || 0).toLocaleString('vi-VN')}₫
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">20.000₫</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {(Number(totalPrice || 0) + 20000).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="block">
              <Button className="w-full" size="lg">
                Thanh toán
              </Button>
            </Link>

            <Link to="/products" className="block mt-3">
              <Button variant="outline" className="w-full">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
