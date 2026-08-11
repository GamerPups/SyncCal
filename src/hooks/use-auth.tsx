import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, ApiError, type AuthSession } from '@/api'
import { getGoogleSignInUrl } from '@/api/config'
import { setStoredToken } from '@/api/auth-token'
import type { User } from '@/types'

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signInWithGoogle: () => void
  completeOAuthLogin: (token: string) => Promise<void>
  logout: () => Promise<void>
  authError: string | null
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function restore() {
      try {
        const restored = await api.auth.getSession()
        if (!cancelled) setSession(restored)
      } catch {
        if (!cancelled) {
          setStoredToken(null)
          setSession(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    restore()
    return () => {
      cancelled = true
    }
  }, [])

  const signInWithGoogle = useCallback(() => {
    setAuthError(null)
    window.location.assign(getGoogleSignInUrl())
  }, [])

  const completeOAuthLogin = useCallback(async (token: string) => {
    setAuthError(null)
    try {
      const next = await api.auth.completeOAuth(token)
      setSession(next)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to complete Google sign-in.'
      setAuthError(message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    await api.auth.logout()
    setSession(null)
    setAuthError(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: session !== null,
      isLoading,
      signInWithGoogle,
      completeOAuthLogin,
      logout,
      authError,
      clearAuthError: () => setAuthError(null),
    }),
    [session, isLoading, signInWithGoogle, completeOAuthLogin, logout, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
