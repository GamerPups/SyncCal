import { useMemo } from 'react'
import { useEvents } from '@/hooks/use-events'
import {
  getCurrentTimeTopPx,
  getHourLabels,
  GRID_END_HOUR,
  GRID_START_HOUR,
  HOUR_HEIGHT_PX,
  isSameCalendarDay,
} from '@/lib/calendar-utils'
import { cn, formatDateKey } from '@/lib/utils'
import { AllDayEventPill, TimedEventBlock } from './TimedEventBlock'

type DayViewProps = {
  currentDate: Date
}

export function DayView({ currentDate }: DayViewProps) {
  const { getEventsForDate, openEditForm } = useEvents()
  const today = useMemo(() => new Date(), [])
  const now = useMemo(() => new Date(), [])
  const dateKey = formatDateKey(currentDate)
  const events = getEventsForDate(dateKey)
  const allDayEvents = events.filter((e) => e.allDay)
  const timedEvents = events.filter((e) => !e.allDay)
  const hourLabels = useMemo(
    () => getHourLabels(GRID_START_HOUR, GRID_END_HOUR),
    [],
  )
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR + 1) * HOUR_HEIGHT_PX
  const isToday = isSameCalendarDay(currentDate, today)
  const currentTimeTop = getCurrentTimeTopPx(now, GRID_START_HOUR, GRID_END_HOUR, HOUR_HEIGHT_PX)

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

  return (
    <div className="flex flex-1 flex-col overflow-auto scrollbar-thin">
      <div
        className={cn(
          'border-b border-border px-4 py-3 sm:px-6',
          isWeekend && 'bg-weekend/30',
        )}
      >
        <p className="text-sm text-muted-foreground">{dayName}</p>
        <p className="text-2xl font-semibold tracking-tight">
          {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      {allDayEvents.length > 0 && (
        <div className={cn('border-b border-border px-4 py-2 sm:px-6', isWeekend && 'bg-weekend/20')}>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">All day</p>
          <div className="flex flex-col gap-1">
            {allDayEvents.map((event) => (
              <AllDayEventPill key={event.id} event={event} onSelect={openEditForm} />
            ))}
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative w-16 shrink-0 border-r border-border sm:w-20">
          {hourLabels.map((label, index) => (
            <div
              key={label}
              className="relative border-b border-border/50 text-right"
              style={{ height: HOUR_HEIGHT_PX }}
            >
              {index > 0 && (
                <span className="absolute -top-2 right-2 text-xs text-muted-foreground">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          className={cn('relative min-w-0 flex-1', isWeekend && 'bg-weekend/10')}
          style={{ height: gridHeight }}
        >
          {hourLabels.map((_, index) => (
            <div
              key={index}
              className="border-b border-border/50"
              style={{ height: HOUR_HEIGHT_PX }}
            />
          ))}

          {timedEvents.map((event) => (
            <TimedEventBlock key={event.id} event={event} className="inset-x-2 sm:inset-x-4" onSelect={openEditForm} />
          ))}

          {isToday && currentTimeTop !== null && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-20 flex items-center px-2"
              style={{ top: currentTimeTop }}
              aria-hidden="true"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
              <div className="h-0.5 flex-1 bg-destructive/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
