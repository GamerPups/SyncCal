const WELCOME_KEY = 'synccal-show-welcome'

export function setWelcomePending(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(WELCOME_KEY, '1')
}

export function clearWelcomePending(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(WELCOME_KEY)
}

export function isWelcomePending(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(WELCOME_KEY) === '1'
}

export function firstNameFromDisplayName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0] ?? trimmed
}
