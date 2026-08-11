import type { DisplayEvent } from '@/types'
import { cn, formatTime } from '@/lib/utils'
import { useEvents } from '@/hooks/use-events'
import { isBusyDisplay } from '@/lib/availability'
import { EventVisibilityIndicator } from './EventVisibilityIndicator'

type EventPillProps = {
  event: DisplayEvent
  compact?: boolean
  className?: string
  onSelect?: (event: DisplayEvent) => void
}

export function EventPill({ event, compact = false, className, onSelect }: EventPillProps) {
  const { getEventColor, canEdit } = useEvents()
  const color = getEventColor(event)
  const editable = canEdit(event)
  const busy = isBusyDisplay(event)
  const title = event.displayTitle ?? event.title

  const timeLabel = event.allDay
    ? 'All day'
    : event.startTime
      ? formatTime(event.startTime)
      : ''

  return (
    <div
      className={cn(
        'group flex items-start gap-1 rounded px-1.5 py-0.5 text-left transition-opacity',
        editable ? 'cursor-pointer hover:opacity-90' : 'cursor-default opacity-90',
        busy && 'italic',
        compact ? 'text-[11px] leading-tight' : 'text-xs',
        className,
      )}
      style={{
        backgroundColor: `${color}20`,
        borderLeft: `2px solid ${color}`,
      }}
      role="button"
      tabIndex={editable ? 0 : -1}
      onClick={() => editable && onSelect?.(event)}
      onKeyDown={(e) => {
        if (editable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect?.(event)
        }
      }}
      aria-label={`${title}${timeLabel ? `, ${timeLabel}` : ''}${busy ? ', busy block' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{title}</p>
        {!compact && timeLabel && (
          <p className="truncate text-muted-foreground">{timeLabel}</p>
        )}
      </div>
      {!compact && !busy && <EventVisibilityIndicator event={event} compact />}
    </div>
  )
}
