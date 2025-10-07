import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '@/services/api'

// Interface cho User
interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role: 'customer' | 'admin'
}

// Interface cho AuthContext
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  loading: boolean
}

// Interface cho dữ liệu đăng ký
interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

// Tạo Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (savedToken && savedUser) {
          // Parse user data từ localStorage trước
          try {
            const userData = JSON.parse(savedUser)
            setToken(savedToken)
            setUser(userData)
            
            // Validate token bằng cách gọi API profile (không block UI)
            // Chỉ validate nếu không phải trang login
            if (window.location.pathname !== '/login') {
              // Thêm timeout để tránh chờ quá lâu
              const timeoutId = setTimeout(() => {
                console.log('Timeout khi validate token, giữ nguyên token')
              }, 5000) // 5 giây timeout

              authApi.getProfile()
                .then(() => {
                  clearTimeout(timeoutId)
                  console.log('Token hợp lệ, user vẫn đăng nhập')
                })
                .catch((error) => {
                  clearTimeout(timeoutId)
                  // Chỉ xóa token nếu là lỗi 401 (Unauthorized) - token thực sự không hợp lệ
                  // Không xóa token nếu là lỗi network hoặc server không start
                  if (error.response?.status === 401) {
                    console.log('Token không hợp lệ, đăng xuất user')
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    setToken(null)
                    setUser(null)
                  } else {
                    console.log('Lỗi network hoặc server, giữ nguyên token:', error.message)
                  }
                })
            }
          } catch (parseError) {
            // JSON parse error, xóa localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Hàm đăng nhập
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      const { token: newToken, user: userData } = response.data
      
      setToken(newToken)
      setUser(userData)
      
      // Lưu vào localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  // Hàm đăng ký
  const register = async (userData: RegisterData) => {
    try {
      const response = await authApi.register(userData)
      const { token: newToken, user: newUser } = response.data
      
      setToken(newToken)
      setUser(newUser)
      
      // Lưu vào localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      throw error
    }
  }

  // Hàm đăng xuất
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    setUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook để sử dụng AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
