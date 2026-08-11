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
import { useSharedCalendars } from '@/hooks/use-shared-calendars'

type JoinCalendarDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (calendarName: string) => void
}

export function JoinCalendarDialog({ open, onOpenChange, onSuccess }: JoinCalendarDialogProps) {
  const { joinByInviteCode } = useSharedCalendars()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = joinByInviteCode(code)
    if (!result.success) {
      setError(result.error ?? 'Failed to join calendar.')
      return
    }
    onSuccess?.(result.calendar?.name ?? 'calendar')
    setCode('')
    setError(null)
    onOpenChange(false)
  }

  const handleClose = () => {
    setCode('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Join with Invite Code</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-code">Invite code</Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError(null)
              }}
              placeholder="FAMILY-2026"
              className="font-mono uppercase tracking-wide"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the code shared by a calendar owner. Try <span className="font-mono">FAMILY-2026</span> or <span className="font-mono">GRAND-8X4K</span>.
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
            <Button type="submit">Join Calendar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
