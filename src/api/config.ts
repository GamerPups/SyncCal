/** Base URL for API requests. Empty string uses same-origin /api (Vite proxy or Vercel). */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
}

/** URL to start Google OAuth (full-page redirect). */
export function getGoogleSignInUrl(): string {
  return `${getApiBaseUrl()}/api/auth/google`
}
