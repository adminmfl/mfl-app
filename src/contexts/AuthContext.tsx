import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { storage } from '../lib/storage'
import { setUser as setCrashlyticsUser, clearUser as clearCrashlyticsUser } from '../lib/crashlytics'
import { setUser as setAnalyticsUser, logUserLogin } from '../lib/analytics'

interface User {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  login: (identifier: string) => Promise<{ success: boolean; message?: string }>
  verifyOtp: (identifier: string, otp: string) => Promise<{ success: boolean; user?: User; message?: string }>
  logout: () => Promise<void>
}

const AUTH_USER_KEY = 'mfl_auth_user'
const AUTH_TOKEN_KEY = 'mfl_auth_token'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()
  const sessionRestoreAttempted = useRef(false)

  // On mount: try to restore session from MMKV
  useEffect(() => {
    if (sessionRestoreAttempted.current) return
    sessionRestoreAttempted.current = true

    try {
      const storedUser = storage.getString(AUTH_USER_KEY)
      const storedToken = storage.getString(AUTH_TOKEN_KEY)
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser) as User
        setUser(parsed)
        setAccessToken(storedToken)
        setCrashlyticsUser(parsed.id)
        setAnalyticsUser(parsed.id)
      }
    } catch {
      // No valid session
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (identifier: string): Promise<{ success: boolean; message?: string }> => {
    // Mock login: always succeeds, simulates sending OTP
    return { success: true, message: `OTP sent to ${identifier}` }
  }, [])

  const verifyOtp = useCallback(async (identifier: string, otp: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    // Mock verify: any 6-digit code works
    if (otp.length !== 6) {
      return { success: false, message: 'Please enter a 6-digit code' }
    }

    // Create mock user from identifier
    const isEmail = identifier.includes('@')
    const mockUser: User = {
      id: 'mock-user-1',
      firstName: 'MFL',
      lastName: 'Player',
      email: isEmail ? identifier : undefined,
      phone: !isEmail ? identifier : undefined,
    }

    const mockToken = 'mock-token-' + Date.now()

    // Persist to MMKV
    storage.set(AUTH_USER_KEY, JSON.stringify(mockUser))
    storage.set(AUTH_TOKEN_KEY, mockToken)

    setUser(mockUser)
    setAccessToken(mockToken)
    setCrashlyticsUser(mockUser.id)
    setAnalyticsUser(mockUser.id)
    logUserLogin('otp')

    return { success: true, user: mockUser }
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    setAccessToken(null)
    storage.delete(AUTH_USER_KEY)
    storage.delete(AUTH_TOKEN_KEY)
    clearCrashlyticsUser()
    setAnalyticsUser(null)
    queryClient.clear()
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        accessToken,
        login,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
