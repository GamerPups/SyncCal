import { useState } from 'react'
import { Mail, KeyRound, Check, X } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MemberRoleBadge } from '@/components/shared/MemberRoleBadge'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { getRoleDescription } from '@/lib/permissions'

export function InvitationsPage() {
  const {
    pendingInvitations,
    acceptInvitation,
    declineInvitation,
    joinByInviteCode,
  } = useSharedCalendars()

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null)

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    const result = joinByInviteCode(code)
    if (!result.success) {
      setCodeError(result.error ?? 'Failed to join.')
      setCodeSuccess(null)
      return
    }
    setCode('')
    setCodeError(null)
    setCodeSuccess(`Joined "${result.calendar?.name}" successfully!`)
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Invitations" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Invitations</h1>
        <p className="text-sm text-muted-foreground">
          Accept or decline shared calendar invitations
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Pending invitations */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pending invitations
            </h2>

            {pendingInvitations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
                <Mail className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                <p className="font-medium text-foreground">No pending invitations</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  When someone invites you to a shared calendar, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-soft"
                  >
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{invitation.invitedByName}</span>
                      {' '}invited you to:
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      &ldquo;{invitation.calendarName}&rdquo;
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <MemberRoleBadge role={invitation.role} />
                      <span className="text-xs text-muted-foreground">
                        {getRoleDescription(invitation.role)}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation(invitation.id)}
                        className="gap-1.5"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => declineInvitation(invitation.id)}
                        className="gap-1.5"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Join by code */}
          <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Join with invite code</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Have a code? Enter it below to join a shared calendar directly.
            </p>
            <form onSubmit={handleJoinByCode} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="join-code" className="sr-only">
                  Invite code
                </Label>
                <Input
                  id="join-code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setCodeError(null)
                    setCodeSuccess(null)
                  }}
                  placeholder="FAMILY-2026"
                  className="font-mono uppercase tracking-wide"
                />
              </div>
              <Button type="submit" className="sm:self-end">
                Join Calendar
              </Button>
            </form>
            {codeError && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="mt-2 text-sm text-primary" role="status">
                {codeSuccess}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
