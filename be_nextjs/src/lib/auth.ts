import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Cấu hình JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

// Interface cho JWT payload
export interface JWTPayload {
  userId: number
  email: string
  role: string
}

// Tạo JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Xác thực JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Mã hóa mật khẩu
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Xác thực mật khẩu
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Middleware xác thực cho API routes
export function authenticateToken(req: any): JWTPayload | null {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return null
  }

  return verifyToken(token)
}
