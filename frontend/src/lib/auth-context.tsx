/** Session state: current user + login/register/logout. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { apiFetch, clearTokens, getAccessToken, setTokens } from '@/lib/api-client'
import type { TokenPair, User } from '@/types/api'

interface RegisterPayload {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => getAccessToken() !== null)

  useEffect(() => {
    if (!getAccessToken()) return
    let isActive = true
    apiFetch<User>('/auth/me/')
      .then((profile) => {
        if (isActive) setUser(profile)
      })
      .catch(() => {
        clearTokens()
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })
    return () => {
      isActive = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiFetch<TokenPair>('/auth/token/', {
      method: 'POST',
      body: { email, password },
      anonymous: true,
    })
    setTokens(tokens)
    const profile = await apiFetch<User>('/auth/me/')
    setUser(profile)
  }, [])

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await apiFetch<User>('/auth/register/', {
        method: 'POST',
        body: payload,
        anonymous: true,
      })
      await login(payload.email, payload.password)
    },
    [login],
  )

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
