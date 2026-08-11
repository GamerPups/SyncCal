import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { LIST_CATEGORY_OPTIONS } from '@/config/list-options'
import type { ListCategory } from '@/types'
import { cn } from '@/lib/utils'

type CreateListDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateListDialog({ open, onOpenChange }: CreateListDialogProps) {
  const { createList } = useSharedLists()
  const { sharedCalendars } = useSharedCalendars()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ListCategory>('custom')
  const [calendarId, setCalendarId] = useState(sharedCalendars[0]?.id ?? '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('List name is required.')
      return
    }
    if (!calendarId) {
      setError('Please select a shared calendar.')
      return
    }
    const list = createList(name, category, calendarId)
    if (!list) {
      setError('You do not have permission to create lists for this calendar.')
      return
    }
    setName('')
    setCategory('custom')
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
          <DialogDescription>
            Add a shared household list linked to a calendar your household uses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              placeholder="e.g. Back to School"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="list-calendar">Shared calendar</Label>
            <Select
              id="list-calendar"
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
            >
              {sharedCalendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.name}
                </option>
              ))}
            </Select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Category</legend>
            <div className="grid grid-cols-2 gap-2">
              {LIST_CATEGORY_OPTIONS.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border p-3 text-left transition-colors',
                    category === value
                      ? 'border-primary bg-accent/50'
                      : 'border-border hover:bg-accent/20',
                  )}
                  aria-pressed={category === value}
                >
                  <Icon className="mb-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create List</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
