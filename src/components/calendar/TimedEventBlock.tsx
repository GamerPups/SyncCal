import type { DisplayEvent } from '@/types'
import { cn, formatTime } from '@/lib/utils'
import { useEvents } from '@/hooks/use-events'
import { isBusyDisplay } from '@/lib/availability'
import {
  getEventHeightPx,
  getEventTopPx,
  GRID_START_HOUR,
  HOUR_HEIGHT_PX,
} from '@/lib/calendar-utils'
import { EventVisibilityIndicator } from './EventVisibilityIndicator'

type TimedEventBlockProps = {
  event: DisplayEvent
  className?: string
  showTime?: boolean
  onSelect?: (event: DisplayEvent) => void
}

export function TimedEventBlock({
  event,
  className,
  showTime = true,
  onSelect,
}: TimedEventBlockProps) {
  const { getEventColor, canEdit } = useEvents()

  if (event.allDay || !event.startTime || !event.endTime) return null

  const color = getEventColor(event)
  const editable = canEdit(event)
  const busy = isBusyDisplay(event)
  const title = event.displayTitle ?? event.title
  const top = getEventTopPx(event.startTime, GRID_START_HOUR, HOUR_HEIGHT_PX)
  const height = getEventHeightPx(event.startTime, event.endTime, HOUR_HEIGHT_PX)

  const timeLabel = `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`

  return (
    <div
      className={cn(
        'absolute inset-x-1 z-10 overflow-hidden rounded-md px-2 py-1 text-left shadow-soft transition-opacity',
        editable ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
        busy && 'opacity-80',
        className,
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `${color}25`,
        borderLeft: `3px solid ${color}`,
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
      aria-label={`${title}, ${timeLabel}${busy ? ', busy block' : ''}`}
    >
      <p className={cn('truncate text-xs font-medium text-foreground', busy && 'italic')}>{title}</p>
      {showTime && height >= 36 && (
        <p className="truncate text-[11px] text-muted-foreground">{timeLabel}</p>
      )}
      {height >= 52 && !busy && <EventVisibilityIndicator event={event} compact className="mt-0.5" />}
    </div>
  )
}

type AllDayEventPillProps = {
  event: DisplayEvent
  onSelect?: (event: DisplayEvent) => void
}

export function AllDayEventPill({ event, onSelect }: AllDayEventPillProps) {
  const { getEventColor, canEdit } = useEvents()
  const color = getEventColor(event)
  const editable = canEdit(event)
  const busy = isBusyDisplay(event)
  const title = event.displayTitle ?? event.title

  return (
    <div
      className={cn(
        'truncate rounded px-2 py-0.5 text-[11px] font-medium transition-opacity sm:text-xs',
        editable ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
        busy && 'italic opacity-80',
      )}
      style={{
        backgroundColor: `${color}25`,
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
      aria-label={`${title}, all day${busy ? ', busy block' : ''}`}
    >
      {title}
    </div>
  )
}
