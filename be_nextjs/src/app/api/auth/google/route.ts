import { NextRequest, NextResponse } from 'next/server'
import { verifyGoogleToken, handleGoogleAuth } from '@/lib/google-auth'

// POST /api/auth/google - Đăng nhập bằng Google
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()

    // Kiểm tra dữ liệu đầu vào
    if (!idToken) {
      return NextResponse.json(
        { error: 'Google ID token là bắt buộc' },
        { status: 400 }
      )
    }

    // Xác thực Google token
    const googleUser = await verifyGoogleToken(idToken)
    if (!googleUser) {
      return NextResponse.json(
        { error: 'Token Google không hợp lệ' },
        { status: 401 }
      )
    }

    // Xử lý đăng nhập/đăng ký
    const result = await handleGoogleAuth(googleUser)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Lỗi đăng nhập Google:', error)
    return NextResponse.json(
      { error: error.message || 'Lỗi đăng nhập Google' },
      { status: 500 }
    )
  }
}
