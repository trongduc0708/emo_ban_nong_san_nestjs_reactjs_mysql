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
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
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
