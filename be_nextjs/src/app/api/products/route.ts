import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - Lấy danh sách sản phẩm
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    // Xây dựng điều kiện where
    const where: any = {
      isActive: true
    }

    // Lọc theo danh mục
    if (category) {
      where.category = {
        slug: category
      }
    }

    // Tìm kiếm theo tên
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          price: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) })
          }
        }
      }
    }

    // Xây dựng orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price_asc') {
      orderBy = { variants: { _count: 'asc' } }
    } else if (sort === 'price_desc') {
      orderBy = { variants: { _count: 'desc' } }
    } else if (sort === 'name') {
      orderBy = { name: 'asc' }
    }

    // Lấy tổng số sản phẩm
    const total = await prisma.product.count({ where })

    // Lấy danh sách sản phẩm
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' }
        },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      }
    })

  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error)
    return NextResponse.json(
      { error: 'Lỗi lấy danh sách sản phẩm' },
      { status: 500 }
    )
  }
}
