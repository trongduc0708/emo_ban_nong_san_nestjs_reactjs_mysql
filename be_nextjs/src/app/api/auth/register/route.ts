import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

// POST /api/auth/register - Đăng ký tài khoản
export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json()

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, mật khẩu và họ tên là bắt buộc' },
        { status: 400 }
      )
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      )
    }

    // Mã hóa mật khẩu
    const passwordHash = await hashPassword(password)

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: 'customer',
        provider: 'local'
      }
    })

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
    console.error('Lỗi đăng ký:', error)
    return NextResponse.json(
      { error: 'Lỗi đăng ký tài khoản' },
      { status: 500 }
    )
  }
}
