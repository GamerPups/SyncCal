import { Navigate, useNavigate } from 'react-router-dom'
import { SyncCalLogo } from '@/components/brand/SyncCalLogo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import {
  clearWelcomePending,
  firstNameFromDisplayName,
  isWelcomePending,
} from '@/lib/welcome-session'

export function WelcomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!isWelcomePending()) {
    return <Navigate to="/" replace />
  }

  const firstName = firstNameFromDisplayName(user.name)

  const handleGetStarted = () => {
    clearWelcomePending()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <SyncCalLogo size={56} themed={false} />
        </div>

        <Avatar className="mx-auto mb-6 h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {user.avatarInitials}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Hi, {firstName}!
        </h1>
        <p className="mt-3 text-muted-foreground">
          You&apos;re signed in as{' '}
          <span className="font-medium text-foreground">{user.email}</span>. Your calendars and
          lists are ready whenever you are.
        </p>

        <Button size="lg" className="mt-8 min-w-[200px]" onClick={handleGetStarted}>
          Get Started
        </Button>
      </div>
    </div>
  )
}
