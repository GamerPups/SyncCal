import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InviteCodePrivacyWarning } from '@/components/shared/InviteCodePrivacyWarning'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { api } from '@/api'

export function InvitationsPage() {
  const { joinByInviteCode } = useSharedCalendars()

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [previewName, setPreviewName] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setCodeError('Enter an invite code.')
      return
    }

    setChecking(true)
    setCodeError(null)
    setCodeSuccess(null)
    try {
      const result = await api.calendars.findByInviteCode(code.trim().toUpperCase())
      if (!result) {
        setCodeError('No calendar found with that code.')
        setPreviewName(null)
        return
      }
      setPreviewName(result.calendar.name)
      setConfirmed(false)
    } catch {
      setCodeError('Could not look up that code.')
      setPreviewName(null)
    } finally {
      setChecking(false)
    }
  }

  const handleJoin = async () => {
    if (!confirmed) return
    const result = await joinByInviteCode(code)
    if (!result.success) {
      setCodeError(result.error ?? 'Failed to join.')
      setCodeSuccess(null)
      return
    }
    setCode('')
    setPreviewName(null)
    setConfirmed(false)
    setCodeError(null)
    setCodeSuccess(`Joined "${result.calendar?.name}" successfully!`)
  }

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Join Calendar" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Join Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Enter a private invite code from someone you trust to join their shared calendar
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Join with invite code</h2>
            </div>

            <InviteCodePrivacyWarning variant="join" className="mb-4" />

            {!previewName ? (
              <form onSubmit={handleLookup} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="join-code">Invite code</Label>
                  <Input
                    id="join-code"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase())
                      setCodeError(null)
                      setCodeSuccess(null)
                    }}
                    placeholder="FAMILY-A3B2"
                    className="font-mono uppercase tracking-wide"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Direct invitations are not supported. You need the private code from the calendar owner.
                </p>
                <Button type="submit" disabled={checking || !code.trim()}>
                  {checking ? 'Checking…' : 'Look Up Code'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Calendar found
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{previewName}</p>
                </div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span>
                    I trust the person who gave me this code and understand they will see my name on the shared calendar.
                  </span>
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPreviewName(null)
                      setConfirmed(false)
                    }}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={handleJoin} disabled={!confirmed}>
                    Join Calendar
                  </Button>
                </div>
              </div>
            )}

            {codeError && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="mt-3 text-sm text-primary" role="status">
                {codeSuccess}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
