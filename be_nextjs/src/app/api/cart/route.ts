import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/middleware/auth'

// GET /api/cart - Lấy giỏ hàng
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    // Tìm giỏ hàng của user
    const cart = await prisma.cart.findFirst({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: 'asc' },
                  take: 1
                }
              }
            },
            variant: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: cart?.items || []
      }
    })

  } catch (error) {
    console.error('Lỗi lấy giỏ hàng:', error)
    return NextResponse.json(
      { error: 'Lỗi lấy giỏ hàng' },
      { status: 500 }
    )
  }
})
