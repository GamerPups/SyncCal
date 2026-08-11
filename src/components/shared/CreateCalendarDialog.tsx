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

type CreateCalendarDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCalendarDialog({ open, onOpenChange }: CreateCalendarDialogProps) {
  const { createCalendar } = useSharedCalendars()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Calendar name is required.')
      return
    }
    createCalendar(name.trim())
    setName('')
    setError(null)
    onOpenChange(false)
  }

  const handleClose = () => {
    setName('')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Shared Calendar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="calendar-name">Calendar name</Label>
            <Input
              id="calendar-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="e.g. Family, Roommates, Team"
              autoFocus
            />
          </div>
          <p className="text-sm text-muted-foreground">
            You will be the owner. An invite code will be generated so others can join.
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
            <Button type="submit">Create Calendar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
