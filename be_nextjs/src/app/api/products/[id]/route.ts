import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/[id] - Lấy chi tiết sản phẩm
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'ID sản phẩm không hợp lệ' },
        { status: 400 }
      )
    }

    // Lấy thông tin sản phẩm
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      },
      include: {
        category: {
          include: {
            parent: true
          }
        },
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Sản phẩm không tồn tại' },
        { status: 404 }
      )
    }

    // Tính điểm đánh giá trung bình
    const avgRating = product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0

    // Lấy sản phẩm liên quan (cùng danh mục)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true
      },
      include: {
        images: {
          orderBy: { position: 'asc' },
          take: 1
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1
        }
      },
      take: 4
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        relatedProducts
      }
    })

  } catch (error) {
    console.error('Lỗi lấy chi tiết sản phẩm:', error)
    return NextResponse.json(
      { error: 'Lỗi lấy chi tiết sản phẩm' },
      { status: 500 }
    )
  }
}
