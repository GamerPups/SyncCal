import { useMemo } from 'react'
import { useEvents } from '@/hooks/use-events'
import type { DisplayEvent } from '@/types'
import { formatAgendaDateHeader, isSameCalendarDay } from '@/lib/calendar-utils'
import { cn, formatTime } from '@/lib/utils'
import { isBusyDisplay } from '@/lib/availability'
import { EventVisibilityIndicator } from './EventVisibilityIndicator'

type AgendaViewProps = {
  currentDate: Date
}

function AgendaEventRow({
  event,
  onSelect,
}: {
  event: DisplayEvent
  onSelect: (event: DisplayEvent) => void
}) {
  const { getEventColor, canEdit } = useEvents()
  const color = getEventColor(event)
  const editable = canEdit(event)
  const busy = isBusyDisplay(event)
  const title = event.displayTitle ?? event.title

  const timeLabel = event.allDay
    ? 'All day'
    : event.startTime && event.endTime
      ? `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
      : event.startTime
        ? formatTime(event.startTime)
        : ''

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-2.5 shadow-soft transition-colors',
        editable ? 'cursor-pointer hover:bg-accent/30' : 'cursor-default',
      )}
      role="button"
      tabIndex={editable ? 0 : -1}
      onClick={() => editable && onSelect(event)}
      onKeyDown={(e) => {
        if (editable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(event)
        }
      }}
      aria-label={`${title}, ${timeLabel}${busy ? ', busy block' : ''}`}
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
        </div>
        <p className="text-sm text-muted-foreground">{timeLabel}</p>
        {event.location && !busy && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{event.location}</p>
        )}
      </div>
    </div>
  )
}

export function AgendaView({ currentDate }: AgendaViewProps) {
  const { getEventsForMonth, openEditForm } = useEvents()
  const today = useMemo(() => new Date(), [])
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const events = useMemo(
    () => getEventsForMonth(year, month),
    [getEventsForMonth, year, month],
  )

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, DisplayEvent[]>()
    for (const event of events) {
      const existing = groups.get(event.date) ?? []
      existing.push(event)
      groups.set(event.date, existing)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  if (groupedEvents.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-lg font-medium text-foreground">No events this month</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your calendar filters or add a new event.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-4 scrollbar-thin sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {groupedEvents.map(([dateKey, dayEvents]) => {
          const date = new Date(
            Number(dateKey.slice(0, 4)),
            Number(dateKey.slice(5, 7)) - 1,
            Number(dateKey.slice(8, 10)),
          )
          const isToday = isSameCalendarDay(date, today)
          const header = formatAgendaDateHeader(date, today)

          return (
            <section key={dateKey} aria-label={header}>
              <div className="mb-2 flex items-baseline gap-2">
                <h2
                  className={cn(
                    'text-sm font-semibold',
                    isToday ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {header}
                </h2>
                {!isToday && header !== 'Tomorrow' && (
                  <span className="text-xs text-muted-foreground">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <AgendaEventRow key={event.id} event={event} onSelect={openEditForm} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
