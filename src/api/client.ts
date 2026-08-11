import type { AuthSession, BackendState } from '@/api/types'
import { ApiError } from '@/api/types'
import { getStoredToken, setStoredToken } from '@/api/auth-token'
import { getApiBaseUrl } from '@/api/config'

async function httpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body.message ?? `Request failed (${response.status})`, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  auth: {
    logout(): Promise<void> {
      return httpFetch<void>('/api/auth/logout', { method: 'POST' }).finally(() =>
        setStoredToken(null),
      )
    },
    getSession(): Promise<AuthSession | null> {
      return httpFetch<AuthSession | null>('/api/auth/me')
    },
    completeOAuth(token: string): Promise<AuthSession> {
      setStoredToken(token)
      return httpFetch<AuthSession>('/api/auth/me').then((session) => {
        if (!session) throw new ApiError('Unable to restore session.', 401)
        setStoredToken(session.token)
        return session
      })
    },
  },
  data: {
    getState(): Promise<BackendState> {
      return httpFetch<BackendState>('/api/data')
    },
    saveState(state: BackendState): Promise<BackendState> {
      return httpFetch<BackendState>('/api/data', {
        method: 'PUT',
        body: JSON.stringify(state),
      })
    },
    patchState(patch: Partial<BackendState>): Promise<BackendState> {
      return httpFetch<BackendState>('/api/data', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
    },
  },
  calendars: {
    findById(calendarId: string): Promise<{ calendar: import('@/types').SharedCalendar }> {
      return httpFetch(`/api/calendars/by-id/${encodeURIComponent(calendarId)}`)
    },
    findByInviteCode(code: string): Promise<{ calendar: import('@/types').SharedCalendar }> {
      return httpFetch(`/api/calendars/by-invite/${encodeURIComponent(code.trim())}`)
    },
  },
}

export function useHttpClient(): boolean {
  return true
}
