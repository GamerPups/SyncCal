import type { CalendarView } from '@/types'

export const FIRST_DAY_OF_WEEK = 0 // 0 = Sunday

export const GRID_START_HOUR = 6
export const GRID_END_HOUR = 22
export const HOUR_HEIGHT_PX = 56

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate())
}

export function startOfWeek(date: Date, firstDayOfWeek = FIRST_DAY_OF_WEEK): Date {
  const day = date.getDay()
  const diff = (day - firstDayOfWeek + 7) % 7
  return addDays(date, -diff)
}

export function endOfWeek(date: Date, firstDayOfWeek = FIRST_DAY_OF_WEEK): Date {
  return addDays(startOfWeek(date, firstDayOfWeek), 6)
}

export function getWeekDays(date: Date, firstDayOfWeek = FIRST_DAY_OF_WEEK): Date[] {
  const start = startOfWeek(date, firstDayOfWeek)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatTimeRange(startTime: string | null, endTime: string | null): string {
  if (!startTime) return 'All day'
  const start = formatTimeFromString(startTime)
  if (!endTime) return start
  return `${start} – ${formatTimeFromString(endTime)}`
}

function formatTimeFromString(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

export function formatHeaderTitle(date: Date, view: CalendarView): string {
  switch (view) {
    case 'month':
    case 'agenda':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'week': {
      const weekStart = startOfWeek(date)
      const weekEnd = endOfWeek(date)
      const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
      const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()

      if (sameMonth && sameYear) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'long' })} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      }
      if (sameYear) {
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${weekStart.getFullYear()}`
      }
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    case 'day':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
  }
}

export function getNavigationLabels(view: CalendarView): {
  previous: string
  next: string
  previousAria: string
  nextAria: string
} {
  switch (view) {
    case 'month':
      return {
        previous: 'Previous month',
        next: 'Next month',
        previousAria: 'Previous month',
        nextAria: 'Next month',
      }
    case 'week':
      return {
        previous: 'Previous week',
        next: 'Next week',
        previousAria: 'Previous week',
        nextAria: 'Next week',
      }
    case 'day':
      return {
        previous: 'Previous day',
        next: 'Next day',
        previousAria: 'Previous day',
        nextAria: 'Next day',
      }
    case 'agenda':
      return {
        previous: 'Previous month',
        next: 'Next month',
        previousAria: 'Previous month',
        nextAria: 'Next month',
      }
  }
}

export function getHourLabels(startHour: number, endHour: number): string[] {
  const labels: string[] = []
  for (let hour = startHour; hour <= endHour; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    labels.push(`${displayHour} ${period}`)
  }
  return labels
}

export function getEventTopPx(
  startTime: string,
  startHour: number,
  hourHeight: number,
): number {
  const minutes = parseTimeToMinutes(startTime)
  const startMinutes = startHour * 60
  return ((minutes - startMinutes) / 60) * hourHeight
}

export function getEventHeightPx(
  startTime: string,
  endTime: string,
  hourHeight: number,
  minHeight = 24,
): number {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)
  const durationMinutes = Math.max(end - start, 15)
  return Math.max((durationMinutes / 60) * hourHeight, minHeight)
}

export function formatDayHeader(date: Date): { dayName: string; dayNumber: number } {
  return {
    dayName: WEEKDAY_SHORT[date.getDay()],
    dayNumber: date.getDate(),
  }
}

export function formatAgendaDateHeader(date: Date, today: Date): string {
  const tomorrow = addDays(today, 1)
  if (isSameCalendarDay(date, today)) return 'Today'
  if (isSameCalendarDay(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getCurrentTimeTopPx(
  now: Date,
  startHour: number,
  endHour: number,
  hourHeight: number,
): number | null {
  const hours = now.getHours()
  const minutes = now.getMinutes()
  if (hours < startHour || hours > endHour) return null
  return ((hours - startHour) * 60 + minutes) / 60 * hourHeight
}
