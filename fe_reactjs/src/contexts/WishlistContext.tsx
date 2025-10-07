import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { wishlistApi } from '@/services/api'
import { useAuth } from './AuthContext'

interface WishlistItem {
  id: number
  productId: number
  userId: number
  createdAt: string
  product: {
    id: number
    name: string
    description: string
    category: {
      id: number
      name: string
    }
    images: Array<{ imageUrl: string }>
    variants: Array<{
      id: number
      variantName: string
      price: number
      compareAtPrice?: number
    }>
    avgRating: number
    reviewCount: number
  }
}

interface WishlistContextType {
  wishlistItems: WishlistItem[]
  addToWishlist: (productId: number) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()

  const loadWishlist = async () => {
    if (!user || !token) {
      setWishlistItems([])
      return
    }
    
    try {
      setLoading(true)
      const response = await wishlistApi.getWishlist()
      console.log('🔍 WishlistContext - API response:', response.data)
      console.log('🔍 WishlistContext - response.data.data:', response.data.data)
      if (response.data.data && response.data.data.length > 0) {
        console.log('🔍 WishlistContext - first item:', response.data.data[0])
        console.log('🔍 WishlistContext - first item product:', response.data.data[0].product)
      }
      setWishlistItems(response.data.data || [])
    } catch (error) {
      console.error('Lỗi tải danh sách yêu thích:', error)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [user, token])

  const addToWishlist = async (productId: number) => {
    console.log('🔍 addToWishlist called with productId:', productId)
    console.log('🔍 user:', user)
    console.log('🔍 token:', token)
    
    if (!user || !token) {
      console.log('❌ No user or token')
      throw new Error('Vui lòng đăng nhập để thêm vào danh sách yêu thích')
    }
    
    try {
      setLoading(true)
      console.log('📤 Calling wishlistApi.addToWishlist...')
      await wishlistApi.addToWishlist(productId)
      console.log('✅ Successfully added to wishlist')
      await loadWishlist() // Reload wishlist
    } catch (error) {
      console.error('❌ Error adding to wishlist:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!user || !token) {
      throw new Error('Vui lòng đăng nhập để xóa khỏi danh sách yêu thích')
    }
    
    try {
      setLoading(true)
      await wishlistApi.removeFromWishlist(productId)
      await loadWishlist() // Reload wishlist
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId)
  }

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
