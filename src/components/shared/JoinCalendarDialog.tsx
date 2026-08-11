import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InviteCodePrivacyWarning } from '@/components/shared/InviteCodePrivacyWarning'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { api } from '@/api'

type JoinCalendarDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (calendarName: string) => void
}

export function JoinCalendarDialog({ open, onOpenChange, onSuccess }: JoinCalendarDialogProps) {
  const { joinByInviteCode } = useSharedCalendars()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [previewName, setPreviewName] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const reset = () => {
    setCode('')
    setError(null)
    setConfirmed(false)
    setPreviewName(null)
    setChecking(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Enter an invite code.')
      return
    }

    setChecking(true)
    setError(null)
    try {
      const result = await api.calendars.findByInviteCode(code.trim().toUpperCase())
      if (!result) {
        setError('No calendar found with that code. Check the code and try again.')
        setPreviewName(null)
        return
      }
      setPreviewName(result.calendar.name)
    } catch {
      setError('Could not look up that code. Try again.')
      setPreviewName(null)
    } finally {
      setChecking(false)
    }
  }

  const handleJoin = async () => {
    if (!confirmed) return
    const result = await joinByInviteCode(code)
    if (!result.success) {
      setError(result.error ?? 'Failed to join calendar.')
      return
    }
    onSuccess?.(result.calendar?.name ?? 'calendar')
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join with Invite Code</DialogTitle>
        </DialogHeader>

        {!previewName ? (
          <form onSubmit={handleLookup} className="space-y-4">
            <InviteCodePrivacyWarning variant="join" />
            <div className="space-y-1.5">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError(null)
                }}
                placeholder="FAMILY-A3B2"
                className="font-mono uppercase tracking-wide"
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Ask the calendar owner for the private invite code. Direct invitations are not supported.
            </p>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={checking || !code.trim()}>
                {checking ? 'Checking…' : 'Continue'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <InviteCodePrivacyWarning variant="join" />
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Calendar found
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{previewName}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{code}</p>
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
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPreviewName(null)}>
                Back
              </Button>
              <Button type="button" onClick={handleJoin} disabled={!confirmed}>
                Join Calendar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
