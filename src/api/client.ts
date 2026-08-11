import type { AuthSession, BackendState, LoginRequest } from '@/api/types'
import { getStoredToken, setStoredToken } from '@/api/auth-token'
import { mockApi } from '@/api/mock-client'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''

async function httpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function useHttpClient(): boolean {
  return Boolean(API_BASE)
}

export const api = {
  auth: {
    login(request: LoginRequest): Promise<AuthSession> {
      if (!useHttpClient()) return mockApi.auth.login(request)
      return httpFetch<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(request),
      }).then((session) => {
        setStoredToken(session.token)
        return session
      })
    },
    logout(): Promise<void> {
      if (!useHttpClient()) return mockApi.auth.logout()
      return httpFetch<void>('/api/auth/logout', { method: 'POST' }).finally(() =>
        setStoredToken(null),
      )
    },
    getSession(): Promise<AuthSession | null> {
      if (!useHttpClient()) return mockApi.auth.getSession()
      return httpFetch<AuthSession | null>('/api/auth/me')
    },
  },
  data: {
    getState(): Promise<BackendState> {
      if (!useHttpClient()) return mockApi.data.getState()
      return httpFetch<BackendState>('/api/data')
    },
    saveState(state: BackendState): Promise<BackendState> {
      if (!useHttpClient()) return mockApi.data.saveState(state)
      return httpFetch<BackendState>('/api/data', {
        method: 'PUT',
        body: JSON.stringify(state),
      })
    },
    patchState(patch: Partial<BackendState>): Promise<BackendState> {
      if (!useHttpClient()) return mockApi.data.patchState(patch)
      return httpFetch<BackendState>('/api/data', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
    },
  },
}

export { useHttpClient }
