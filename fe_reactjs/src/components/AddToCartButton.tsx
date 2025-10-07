import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface AddToCartButtonProps {
  productId: number
  variantId?: number | null
  quantity?: number
  productName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  children?: React.ReactNode
}

export default function AddToCartButton({
  productId,
  variantId = null,
  quantity = 1,
  productName,
  size = 'md',
  className = '',
  children
}: AddToCartButtonProps) {
  const [addingToCart, setAddingToCart] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async () => {
    // Kiểm tra user đã đăng nhập chưa
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
        duration: 3000,
      })
      navigate('/login')
      return
    }

    try {
      setAddingToCart(true)
      
      await addToCart(productId, variantId, quantity)
      
      const message = quantity > 1 
        ? `Đã thêm ${quantity} "${productName || 'sản phẩm'}" vào giỏ hàng!`
        : `Đã thêm "${productName || 'sản phẩm'}" vào giỏ hàng!`
      
      toast.success(message, {
        duration: 3000,
        icon: '🛒',
      })
    } catch (error: any) {
      console.error('Lỗi thêm vào giỏ hàng:', error)
      
      // Xử lý lỗi authentication
      if (error.message?.includes('đăng nhập')) {
        toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', {
          duration: 3000,
        })
        navigate('/login')
      } else {
        toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng', {
          duration: 4000,
        })
      }
    } finally {
      setAddingToCart(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={addingToCart}
      className={`flex items-center justify-center space-x-2 ${sizeClasses[size]} ${className}`}
    >
      {addingToCart ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Đang thêm...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>{children || 'Thêm vào giỏ'}</span>
        </>
      )}
    </Button>
  )
}
