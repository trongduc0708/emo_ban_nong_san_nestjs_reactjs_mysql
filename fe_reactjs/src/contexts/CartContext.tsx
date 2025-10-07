import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { productApi } from '@/services/api'
import { useAuth } from './AuthContext'
import { calculateTotalPrice } from '@/utils/priceUtils'

// Interface cho CartItem
interface CartItem {
  id: number
  productId: number
  variantId?: number
  quantity: number
  unitPriceSnapshot: number
  product: {
    id: number
    name: string
    slug: string
    images: Array<{ imageUrl: string }>
    variants: Array<{
      id: number
      variantName: string
      price: number
    }>
  }
  variant?: {
    id: number
    variantName: string
    price: number
  }
}

// Interface cho CartContext
interface CartContextType {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addToCart: (productId: number, variantId: number | null, quantity: number) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loading: boolean
}

// Tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  // Tính tổng số lượng và tổng tiền
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = calculateTotalPrice(items)

  // Tải giỏ hàng từ API
  const loadCart = async () => {
    // Chỉ load cart khi user đã đăng nhập
    if (!user || !token) {
      setItems([])
      return
    }

    try {
      setLoading(true)
      const response = await productApi.getCart()
      console.log('Cart response:', response.data)
      console.log('Cart items:', response.data.data?.items)
      if (response.data.data?.items) {
        console.log('First item unitPriceSnapshot:', response.data.data.items[0]?.unitPriceSnapshot)
        console.log('First item unitPriceSnapshot type:', typeof response.data.data.items[0]?.unitPriceSnapshot)
      }
      setItems(response.data.data?.items || [])
    } catch (error) {
      console.error('Lỗi tải giỏ hàng:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Khởi tạo giỏ hàng khi user đăng nhập
  useEffect(() => {
    loadCart()
  }, [user, token])

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (productId: number, variantId: number | null, quantity: number) => {
    // Kiểm tra user đã đăng nhập chưa
    if (!user || !token) {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
    }

    try {
      setLoading(true)
      const response = await productApi.addToCart({ productId, variantId, quantity })
      console.log('Add to cart response:', response.data)
      
      // Cập nhật state ngay lập tức từ response
      if (response.data?.data?.items) {
        setItems(response.data.data.items)
      } else {
        // Nếu không có items trong response, tải lại giỏ hàng
        await loadCart()
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (itemId: number) => {
    if (!user || !token) {
      throw new Error('Vui lòng đăng nhập để thực hiện thao tác này')
    }

    try {
      setLoading(true)
      await productApi.removeFromCart(itemId)
      await loadCart() // Tải lại giỏ hàng
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật số lượng
  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!user || !token) {
      throw new Error('Vui lòng đăng nhập để thực hiện thao tác này')
    }

    try {
      setLoading(true)
      await productApi.updateCartItem(itemId, { quantity })
      await loadCart() // Tải lại giỏ hàng
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!user || !token) {
      throw new Error('Vui lòng đăng nhập để thực hiện thao tác này')
    }

    try {
      setLoading(true)
      await productApi.clearCart()
      setItems([])
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loading
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Hook để sử dụng CartContext
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
