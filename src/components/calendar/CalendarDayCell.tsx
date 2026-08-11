import { useState } from 'react'
import type { DisplayEvent } from '@/types'
import { cn, formatDateKey } from '@/lib/utils'
import { EventPill } from './EventPill'

const MAX_VISIBLE_EVENTS = 3

type CalendarDayCellProps = {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  events: DisplayEvent[]
  onSelectEvent?: (event: DisplayEvent) => void
}

export function CalendarDayCell({
  date,
  isCurrentMonth,
  isToday,
  isWeekend,
  events,
  onSelectEvent,
}: CalendarDayCellProps) {
  const [expanded, setExpanded] = useState(false)
  const dayNumber = date.getDate()
  const visibleEvents = expanded ? events : events.slice(0, MAX_VISIBLE_EVENTS)
  const overflowCount = events.length - MAX_VISIBLE_EVENTS

  return (
    <div
      className={cn(
        'flex min-h-[100px] flex-col border-b border-r border-border p-1.5 sm:min-h-[110px] sm:p-2 lg:min-h-[120px]',
        isWeekend && 'bg-weekend/50',
        !isCurrentMonth && 'bg-muted/30',
      )}
      role="gridcell"
      aria-label={date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    >
      <div className="mb-1 flex justify-end">
        <span
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
            isToday && 'bg-today text-today-foreground',
            !isToday && isCurrentMonth && 'text-foreground',
            !isToday && !isCurrentMonth && 'text-muted-foreground',
          )}
          aria-current={isToday ? 'date' : undefined}
        >
          {dayNumber}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {visibleEvents.map((event) => (
          <EventPill key={event.id} event={event} compact onSelect={onSelectEvent} />
        ))}

        {!expanded && overflowCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-auto rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Show ${overflowCount} more events on ${formatDateKey(date)}`}
          >
            + {overflowCount} more
          </button>
        )}

        {expanded && overflowCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-auto rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  )
}
