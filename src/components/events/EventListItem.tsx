import type { DisplayEvent } from '@/types'
import { cn } from '@/lib/utils'
import { useEvents } from '@/hooks/use-events'
import { isBusyDisplay } from '@/lib/availability'
import { EventVisibilityIndicator } from '@/components/calendar/EventVisibilityIndicator'
import { formatEventTimeLabel } from '@/lib/upcoming-utils'

type EventListItemProps = {
  event: DisplayEvent
  onSelect?: (event: DisplayEvent) => void
  showDate?: boolean
  highlight?: 'now' | 'upcoming' | null
  className?: string
}

export function EventListItem({
  event,
  onSelect,
  showDate = false,
  highlight = null,
  className,
}: EventListItemProps) {
  const { getEventColor, canEdit, openEditForm } = useEvents()
  const color = getEventColor(event)
  const editable = canEdit(event)
  const busy = isBusyDisplay(event)
  const title = event.displayTitle ?? event.title
  const timeLabel = formatEventTimeLabel(event)

  const handleSelect = () => {
    if (editable) {
      if (onSelect) onSelect(event)
      else openEditForm(event)
    }
  }

  const eventDate = new Date(
    Number(event.date.slice(0, 4)),
    Number(event.date.slice(5, 7)) - 1,
    Number(event.date.slice(8, 10)),
  )

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-soft transition-colors',
        highlight === 'now' && 'border-primary/40 bg-primary/5',
        highlight === 'upcoming' && 'border-border',
        editable ? 'cursor-pointer hover:bg-accent/30' : 'cursor-default',
        className,
      )}
      role="button"
      tabIndex={editable ? 0 : -1}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (editable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleSelect()
        }
      }}
      aria-label={`${title}, ${timeLabel}`}
    >
      <div
        className="mt-1 h-full min-h-[2rem] w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className={cn('font-medium text-foreground', busy && 'italic')}>{title}</p>
          {!busy && <EventVisibilityIndicator event={event} />}
          {highlight === 'now' && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
              Now
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {showDate && (
            <span>
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
              {' · '}
            </span>
          )}
          {timeLabel}
        </p>
        {event.location && !busy && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.location}</p>
        )}
      </div>
    </div>
  )
}
