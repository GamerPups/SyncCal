import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { DEMO_USERS } from '@/data/demo-users'

export function LoginPage() {
  const { login, isAuthenticated, isLoading, authError, clearAuthError } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('ashton@example.com')
  const [password, setPassword] = useState('demo123')
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAuthError()
    setSubmitting(true)
    try {
      await login({ email, password })
    } catch {
      // error shown via authError
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('demo123')
    clearAuthError()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Calendar className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">SyncCal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your calendar is yours. Your household calendar is shared.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <p className="text-sm text-destructive" role="alert">
                {authError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting || isLoading}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Demo accounts
            </p>
            <div className="flex flex-wrap gap-2">
              {DEMO_USERS.map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo(user.email)}
                >
                  {user.name}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Password for all demo accounts: demo123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
