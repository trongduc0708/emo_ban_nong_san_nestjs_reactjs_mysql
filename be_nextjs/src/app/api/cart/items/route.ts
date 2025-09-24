import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/middleware/auth'

// POST /api/cart/items - Thêm sản phẩm vào giỏ hàng
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const { productId, variantId, quantity } = await req.json()

    // Kiểm tra dữ liệu đầu vào
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      },
      include: {
        variants: {
          where: { isActive: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Kiểm tra variant nếu có
    let selectedVariant = null
    if (variantId) {
      selectedVariant = product.variants.find(v => v.id === variantId)
      if (!selectedVariant) {
        return NextResponse.json(
          { error: 'Biến thể sản phẩm không tồn tại' },
          { status: 404 }
        )
      }
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await prisma.cart.findFirst({
      where: { userId: user.userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.userId }
      })
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    })

    if (existingItem) {
      // Cập nhật số lượng
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          unitPriceSnapshot: selectedVariant?.price || product.variants[0]?.price || 0
        }
      })
    } else {
      // Thêm mới vào giỏ hàng
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          unitPriceSnapshot: selectedVariant?.price || product.variants[0]?.price || 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Đã thêm sản phẩm vào giỏ hàng'
    })

  } catch (error) {
    console.error('Lỗi thêm sản phẩm vào giỏ hàng:', error)
    return NextResponse.json(
      { error: 'Lỗi thêm sản phẩm vào giỏ hàng' },
      { status: 500 }
    )
  }
})
