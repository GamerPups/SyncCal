import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export function AuthCallbackPage() {
  const { completeOAuthLogin, isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setFailed(true)
      return
    }

    completeOAuthLogin(token).catch(() => {
      setFailed(true)
    })
  }, [searchParams, completeOAuthLogin])

  if (failed) {
    return <Navigate to="/login?error=oauth_failed" replace />
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Completing sign-in…</p>
    </div>
  )
}
