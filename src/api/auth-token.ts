const TOKEN_KEY = 'synccal-auth-token'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function createToken(userId: string): string {
  return btoa(`${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`)
}

export function parseTokenUserId(token: string): string | null {
  try {
    const decoded = atob(token)
    const userId = decoded.split(':')[0]
    return userId || null
  } catch {
    return null
  }
}
