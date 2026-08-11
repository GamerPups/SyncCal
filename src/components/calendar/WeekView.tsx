import { useMemo } from 'react'
import { useEvents } from '@/hooks/use-events'
import {
  FIRST_DAY_OF_WEEK,
  formatDayHeader,
  getCurrentTimeTopPx,
  getHourLabels,
  getWeekDays,
  GRID_END_HOUR,
  GRID_START_HOUR,
  HOUR_HEIGHT_PX,
  isSameCalendarDay,
} from '@/lib/calendar-utils'
import { cn, formatDateKey } from '@/lib/utils'
import { AllDayEventPill, TimedEventBlock } from './TimedEventBlock'

type WeekViewProps = {
  currentDate: Date
  firstDayOfWeek?: number
}

export function WeekView({ currentDate, firstDayOfWeek = FIRST_DAY_OF_WEEK }: WeekViewProps) {
  const { getEventsForDate, openEditForm } = useEvents()
  const today = useMemo(() => new Date(), [])
  const now = useMemo(() => new Date(), [])
  const weekDays = useMemo(
    () => getWeekDays(currentDate, firstDayOfWeek),
    [currentDate, firstDayOfWeek],
  )
  const hourLabels = useMemo(
    () => getHourLabels(GRID_START_HOUR, GRID_END_HOUR),
    [],
  )
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR + 1) * HOUR_HEIGHT_PX
  const currentTimeTop = getCurrentTimeTopPx(now, GRID_START_HOUR, GRID_END_HOUR, HOUR_HEIGHT_PX)

  const weekHasAllDay = weekDays.some((day) =>
    getEventsForDate(formatDateKey(day)).some((e) => e.allDay),
  )

  return (
    <div className="flex flex-1 flex-col overflow-auto scrollbar-thin">
      <div className="sticky top-0 z-20 flex border-b border-border bg-background">
        <div className="w-12 shrink-0 border-r border-border sm:w-16" />
        {weekDays.map((day) => {
          const { dayName, dayNumber } = formatDayHeader(day)
          const isToday = isSameCalendarDay(day, today)
          const isWeekend = day.getDay() === 0 || day.getDay() === 6

          return (
            <div
              key={formatDateKey(day)}
              className={cn(
                'min-w-0 flex-1 border-r border-border px-1 py-2 text-center last:border-r-0 sm:px-2',
                isWeekend && 'bg-weekend/30',
              )}
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.charAt(0)}</span>
              </p>
              <p
                className={cn(
                  'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                  isToday && 'bg-today text-today-foreground',
                  !isToday && 'text-foreground',
                )}
                aria-current={isToday ? 'date' : undefined}
              >
                {dayNumber}
              </p>
            </div>
          )
        })}
      </div>

      {weekHasAllDay && (
        <div className="flex border-b border-border">
          <div className="flex w-12 shrink-0 items-center justify-end border-r border-border px-1 sm:w-16">
            <span className="text-[10px] text-muted-foreground">All day</span>
          </div>
          {weekDays.map((day) => {
            const dateKey = formatDateKey(day)
            const allDayEvents = getEventsForDate(dateKey).filter((e) => e.allDay)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <div
                key={`allday-${dateKey}`}
                className={cn(
                  'flex min-w-0 flex-1 flex-col gap-0.5 border-r border-border p-1 last:border-r-0',
                  isWeekend && 'bg-weekend/30',
                )}
              >
                {allDayEvents.map((event) => (
                  <AllDayEventPill key={event.id} event={event} onSelect={openEditForm} />
                ))}
              </div>
            )
          })}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative w-12 shrink-0 border-r border-border sm:w-16">
          {hourLabels.map((label, index) => (
            <div
              key={label}
              className="relative border-b border-border/50 text-right"
              style={{ height: HOUR_HEIGHT_PX }}
            >
              {index > 0 && (
                <span className="absolute -top-2 right-1 text-[10px] text-muted-foreground sm:right-2 sm:text-xs">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-1">
          {weekDays.map((day) => {
            const dateKey = formatDateKey(day)
            const timedEvents = getEventsForDate(dateKey).filter((e) => !e.allDay)
            const isToday = isSameCalendarDay(day, today)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <div
                key={dateKey}
                className={cn(
                  'relative min-w-0 flex-1 border-r border-border last:border-r-0',
                  isWeekend && 'bg-weekend/20',
                )}
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
                  <TimedEventBlock key={event.id} event={event} onSelect={openEditForm} />
                ))}

                {isToday && currentTimeTop !== null && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
                    style={{ top: currentTimeTop }}
                    aria-hidden="true"
                  >
                    <div className="h-2 w-2 -translate-x-1 rounded-full bg-destructive" />
                    <div className="h-0.5 flex-1 bg-destructive/70" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
