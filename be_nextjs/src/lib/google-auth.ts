import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

// Khởi tạo Google OAuth client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

// Interface cho Google user info
interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
  verified_email: boolean
}

// Xác thực Google ID token
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload) {
      return null
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
      verified_email: payload.email_verified || false
    }
  } catch (error) {
    console.error('Lỗi xác thực Google token:', error)
    return null
  }
}

// Xử lý đăng nhập/đăng ký với Google
export async function handleGoogleAuth(googleUser: GoogleUserInfo) {
  try {
    // Kiểm tra email đã được xác thực chưa
    if (!googleUser.verified_email) {
      throw new Error('Email chưa được xác thực')
    }

    // Tìm user hiện tại
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    })

    if (user) {
      // User đã tồn tại, cập nhật thông tin Google
      if (user.provider !== 'google') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleUser.id,
            avatarUrl: googleUser.picture,
            emailVerifiedAt: new Date()
          }
        })
      }
    } else {
      // Tạo user mới
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          fullName: googleUser.name,
          avatarUrl: googleUser.picture,
          provider: 'google',
          providerId: googleUser.id,
          role: 'customer',
          emailVerifiedAt: new Date()
        }
      })
    }

    // Tạo JWT token
    const token = generateToken({
      userId: Number(user.id),
      email: user.email,
      role: user.role
    })

    return {
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
    }
  } catch (error) {
    console.error('Lỗi xử lý Google auth:', error)
    throw error
  }
}
