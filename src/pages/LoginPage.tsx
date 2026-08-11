import { useEffect, useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { AppPreviewSlideshow } from '@/components/auth/AppPreviewSlideshow'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const OAUTH_ERRORS: Record<string, string> = {
  oauth_cancelled: 'Google sign-in was cancelled.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  oauth_profile: 'Could not read your Google profile.',
}

export function LoginPage() {
  const { signInWithGoogle, isAuthenticated, isLoading, authError, clearAuthError } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const oauthError = searchParams.get('error')
  const [displayError, setDisplayError] = useState<string | null>(null)

  useEffect(() => {
    if (oauthError) {
      setDisplayError(OAUTH_ERRORS[oauthError] ?? 'Sign-in failed. Please try again.')
    } else {
      setDisplayError(null)
    }
  }, [oauthError])

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const errorMessage = authError ?? displayError

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
        {/* App preview slideshow */}
        <section
          className="flex flex-1 flex-col justify-center bg-muted/30 px-4 py-8 sm:px-8 lg:px-12 lg:py-12"
          aria-label="App preview"
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:text-left">
            Preview SyncCal
          </p>
          <AppPreviewSlideshow />
        </section>

        {/* Sign in */}
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 lg:mx-0">
                <Calendar className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">SyncCal</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Your calendar is yours. Your household calendar is shared.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
              <p className="mb-4 text-sm text-muted-foreground">
                Sign in with Google to save your calendars, lists, and household data.
              </p>

              {errorMessage && (
                <p className="mb-4 text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button
                type="button"
                className="w-full gap-2"
                disabled={isLoading}
                onClick={() => {
                  clearAuthError()
                  setDisplayError(null)
                  signInWithGoogle()
                }}
              >
                <GoogleIcon />
                Continue with Google
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
