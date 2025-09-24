import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from '@/lib/auth'

// Middleware xác thực cho API routes
export function withAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Lấy token từ header Authorization
      const authHeader = req.headers.get('authorization')
      const token = authHeader?.split(' ')[1]

      if (!token) {
        return NextResponse.json(
          { error: 'Token xác thực không được cung cấp' },
          { status: 401 }
        )
      }

      // Xác thực token
      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { error: 'Token không hợp lệ hoặc đã hết hạn' },
          { status: 401 }
        )
      }

      // Gọi handler với thông tin user đã xác thực
      return handler(req, user)
    } catch (error) {
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 401 }
      )
    }
  }
}

// Middleware kiểm tra quyền admin
export function withAdminAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: JWTPayload) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 403 }
      )
    }
    return handler(req, user)
  })
}
