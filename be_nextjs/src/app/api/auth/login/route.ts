import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

// POST /api/auth/login - Đăng nhập
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Kiểm tra mật khẩu
    if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng' },
        { status: 401 }
      )
    }

    // Tạo JWT token
    const token = generateToken({
      userId: Number(user.id),
      email: user.email,
      role: user.role
    })

    // Trả về thông tin user và token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Lỗi đăng nhập:', error)
    return NextResponse.json(
      { error: 'Lỗi đăng nhập' },
      { status: 500 }
    )
  }
}
