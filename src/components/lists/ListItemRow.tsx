import { Calendar, Pencil, Trash2 } from 'lucide-react'
import type { ListItem } from '@/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { getMemberFromCalendars } from '@/data/mock-calendars'
import { cn } from '@/lib/utils'

type ListItemRowProps = {
  item: ListItem
  calendarId: string
  onEdit?: (item: ListItem) => void
}

export function ListItemRow({ item, calendarId, onEdit }: ListItemRowProps) {
  const { toggleItem, canToggle, canDeleteItem, deleteItem } = useSharedLists()
  const { sharedCalendars } = useSharedCalendars()
  const assignee = item.assigneeId
    ? getMemberFromCalendars(sharedCalendars, item.assigneeId)
    : undefined
  const canCheck = canToggle(calendarId)
  const canDelete = canDeleteItem(item)

  const handleToggle = () => {
    if (!canCheck) return
    toggleItem(item.id)
  }

  const handleDelete = () => {
    if (!canDelete) return
    deleteItem(item.id)
  }

  const dueLabel = item.dueDate
    ? new Date(
        Number(item.dueDate.slice(0, 4)),
        Number(item.dueDate.slice(5, 7)) - 1,
        Number(item.dueDate.slice(8, 10)),
      ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-soft transition-colors',
        item.completed && 'bg-muted/30',
      )}
    >
      <input
        type="checkbox"
        checked={item.completed}
        onChange={handleToggle}
        disabled={!canCheck}
        className={cn(
          'mt-1 h-4 w-4 shrink-0 rounded border-input text-primary focus:ring-ring',
          canCheck ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
        )}
        aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              'font-medium text-foreground',
              item.completed && 'text-muted-foreground line-through',
            )}
          >
            {item.title}
          </p>
          {assignee && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarFallback
                  className="text-[8px] text-white"
                  style={{ backgroundColor: assignee.color }}
                >
                  {assignee.initials}
                </AvatarFallback>
              </Avatar>
              {assignee.name}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {dueLabel && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Due {dueLabel}
            </span>
          )}
          {item.notes && <span className="truncate">{item.notes}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {onEdit && canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.title}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
