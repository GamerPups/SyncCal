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
import { Select } from '@/components/ui/select'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { getRoleDescription } from '@/lib/permissions'
import type { MemberRole } from '@/types'

type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  calendarId: string
  calendarName: string
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  calendarId,
  calendarName,
}: InviteMemberDialogProps) {
  const { inviteMember } = useSharedCalendars()
  const [name, setName] = useState('')
  const [role, setRole] = useState<MemberRole>('editor')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name or email is required.')
      return
    }
    inviteMember(calendarId, name.trim(), role)
    setSent(true)
    setName('')
    setError(null)
  }

  const handleClose = () => {
    setName('')
    setRole('editor')
    setError(null)
    setSent(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to {calendarName}</DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-foreground">
              Invitation sent! They will see it in their Invitations page.
            </p>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-name">Name or email</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError(null)
                }}
                placeholder="Mom, dad@example.com"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Permission</Label>
              <Select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </Select>
              <p className="text-xs text-muted-foreground">{getRoleDescription(role)}</p>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
