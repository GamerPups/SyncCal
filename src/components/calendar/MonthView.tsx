import { useMemo } from 'react'
import { useEvents } from '@/hooks/use-events'
import { cn, formatDateKey, isSameDay } from '@/lib/utils'
import { CalendarDayCell } from './CalendarDayCell'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type MonthViewProps = {
  currentDate: Date
  firstDayOfWeek?: number
}

function getMonthGrid(year: number, month: number, firstDayOfWeek: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay()
  const offset = (startDay - firstDayOfWeek + 7) % 7
  const gridStart = new Date(year, month, 1 - offset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    days.push(day)
  }
  return days
}

export function MonthView({ currentDate, firstDayOfWeek = 0 }: MonthViewProps) {
  const { getEventsForDate, openEditForm } = useEvents()
  const today = useMemo(() => new Date(), [])
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const days = useMemo(
    () => getMonthGrid(year, month, firstDayOfWeek),
    [year, month, firstDayOfWeek],
  )

  const orderedWeekdays = useMemo(() => {
    const labels = [...WEEKDAY_LABELS]
    if (firstDayOfWeek === 1) {
      return [...labels.slice(1), labels[0]]
    }
    return labels
  }, [firstDayOfWeek])

  return (
    <div className="flex flex-1 flex-col overflow-auto scrollbar-thin">
      <div
        className="grid grid-cols-7 border-l border-t border-border"
        role="grid"
        aria-label={currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      >
        {orderedWeekdays.map((label, index) => {
          const isWeekend = firstDayOfWeek === 1 ? index >= 5 : index === 0 || index === 6
          return (
            <div
              key={label}
              className={cn(
                'border-b border-r border-border px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm',
                isWeekend && 'bg-weekend/30',
              )}
              role="columnheader"
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.charAt(0)}</span>
            </div>
          )
        })}

        {days.map((date) => {
          const dateKey = formatDateKey(date)
          const events = getEventsForDate(dateKey)
          const isCurrentMonth = date.getMonth() === month
          const isToday = isSameDay(date, today)
          const dayOfWeek = date.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          return (
            <CalendarDayCell
              key={dateKey}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isWeekend={isWeekend}
              events={events}
              onSelectEvent={openEditForm}
            />
          )
        })}
      </div>
    </div>
  )
}
