import { ApiError, type AuthSession, type BackendState, type LoginRequest } from '@/api/types'
import { createToken, getStoredToken, parseTokenUserId, setStoredToken } from '@/api/auth-token'
import { loadBackendState, saveBackendState } from '@/api/mock-store'
import { findDemoUserByEmail, toPublicUser, DEMO_USERS } from '@/data/demo-users'

function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function requireAuth(token: string | null): string {
  if (!token) throw new ApiError('Not authenticated.', 401, 'UNAUTHORIZED')
  const userId = parseTokenUserId(token)
  if (!userId) throw new ApiError('Invalid session.', 401, 'INVALID_TOKEN')
  return userId
}

export const mockAuthApi = {
  async login({ email, password }: LoginRequest): Promise<AuthSession> {
    await delay()
    const user = findDemoUserByEmail(email)
    if (!user || user.password !== password) {
      throw new ApiError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }
    const token = createToken(user.id)
    setStoredToken(token)
    return { token, user: toPublicUser(user) }
  },

  async logout(): Promise<void> {
    await delay(50)
    setStoredToken(null)
  },

  async getSession(token: string | null = getStoredToken()): Promise<AuthSession | null> {
    await delay(50)
    if (!token) return null
    const userId = parseTokenUserId(token)
    if (!userId) {
      setStoredToken(null)
      return null
    }
    const demo = DEMO_USERS.find((u) => u.id === userId)
    if (!demo) {
      setStoredToken(null)
      return null
    }
    return { token, user: toPublicUser(demo) }
  },
}

export const mockDataApi = {
  async getState(token: string | null = getStoredToken()): Promise<BackendState> {
    await delay()
    requireAuth(token)
    return loadBackendState()
  },

  async saveState(state: BackendState, token: string | null = getStoredToken()): Promise<BackendState> {
    await delay(80)
    requireAuth(token)
    saveBackendState(state)
    return state
  },

  async patchState(
    patch: Partial<BackendState>,
    token: string | null = getStoredToken(),
  ): Promise<BackendState> {
    await delay(80)
    requireAuth(token)
    const current = loadBackendState()
    const next = { ...current, ...patch }
    saveBackendState(next)
    return next
  },
}

export const mockApi = {
  auth: mockAuthApi,
  data: mockDataApi,
}
