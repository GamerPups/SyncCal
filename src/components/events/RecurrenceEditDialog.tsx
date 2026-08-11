import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { RecurrenceEditScope } from '@/types'

type RecurrenceEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scope: RecurrenceEditScope) => void
  eventTitle: string
  mode?: 'edit' | 'delete'
}

const SCOPE_OPTIONS: { value: RecurrenceEditScope; label: string; description: string }[] = [
  {
    value: 'this',
    label: 'This event',
    description: 'Only change this occurrence',
  },
  {
    value: 'following',
    label: 'This and following',
    description: 'Change this and all future occurrences',
  },
  {
    value: 'series',
    label: 'Entire series',
    description: 'Change all events in the series',
  },
]

export function RecurrenceEditDialog({
  open,
  onOpenChange,
  onConfirm,
  eventTitle,
  mode = 'edit',
}: RecurrenceEditDialogProps) {
  const isDelete = mode === 'delete'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isDelete ? 'Delete recurring event' : 'Edit recurring event'}</DialogTitle>
          <DialogDescription>
            &ldquo;{eventTitle}&rdquo; is part of a repeating series. What would you like to {isDelete ? 'delete' : 'edit'}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {SCOPE_OPTIONS.map(({ value, label, description }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onConfirm(value)
                onOpenChange(false)
              }}
              className="flex w-full flex-col rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
