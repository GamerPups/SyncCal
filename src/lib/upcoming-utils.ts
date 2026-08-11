import type { CalendarEvent } from '@/types'
import { addDays, endOfWeek, isSameCalendarDay } from '@/lib/calendar-utils'
import { formatDateKey, formatTime } from '@/lib/utils'

export type UpcomingGroup = 'today' | 'tomorrow' | 'this-week' | 'later'

export function getUpcomingGroup(eventDate: Date, today: Date): UpcomingGroup {
  if (isSameCalendarDay(eventDate, today)) return 'today'

  const tomorrow = addDays(today, 1)
  if (isSameCalendarDay(eventDate, tomorrow)) return 'tomorrow'

  const weekEnd = endOfWeek(today)
  if (eventDate <= weekEnd) return 'this-week'

  return 'later'
}

export const UPCOMING_GROUP_LABELS: Record<UpcomingGroup, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This Week',
  later: 'Later',
}

export function getUpcomingEvents(
  events: CalendarEvent[],
  today: Date,
  includePastToday = false,
): CalendarEvent[] {
  const todayKey = formatDateKey(today)
  const nowMinutes = today.getHours() * 60 + today.getMinutes()

  return events
    .filter((event) => {
      if (event.date < todayKey) return false
      if (event.date === todayKey && !includePastToday && !event.allDay && event.endTime) {
        const [h, m] = event.endTime.split(':').map(Number)
        if (h * 60 + m < nowMinutes) return false
      }
      return true
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      if (a.allDay && !b.allDay) return -1
      if (!a.allDay && b.allDay) return 1
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
      return 0
    })
}

export function groupEventsByUpcoming(
  events: CalendarEvent[],
  today: Date,
): Map<UpcomingGroup, CalendarEvent[]> {
  const groups = new Map<UpcomingGroup, CalendarEvent[]>()
  const order: UpcomingGroup[] = ['today', 'tomorrow', 'this-week', 'later']

  for (const key of order) {
    groups.set(key, [])
  }

  for (const event of events) {
    const date = new Date(
      Number(event.date.slice(0, 4)),
      Number(event.date.slice(5, 7)) - 1,
      Number(event.date.slice(8, 10)),
    )
    const group = getUpcomingGroup(date, today)
    groups.get(group)!.push(event)
  }

  return groups
}

import { formatTime } from '@/lib/utils'

export function formatEventTimeLabel(event: CalendarEvent): string {
  if (event.allDay) return 'All day'
  if (event.startTime && event.endTime) {
    return `${formatTime(event.startTime)} – ${formatTime(event.endTime)}`
  }
  if (event.startTime) return formatTime(event.startTime)
  return ''
}

export function isEventHappeningNow(event: CalendarEvent, now: Date): boolean {
  const todayKey = formatDateKey(now)
  if (event.date !== todayKey || event.allDay || !event.startTime || !event.endTime) {
    return false
  }
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = event.startTime.split(':').map(Number)
  const [eh, em] = event.endTime.split(':').map(Number)
  return nowMin >= sh * 60 + sm && nowMin < eh * 60 + em
}

export function isEventUpcomingToday(event: CalendarEvent, now: Date): boolean {
  const todayKey = formatDateKey(now)
  if (event.date !== todayKey) return false
  if (event.allDay) return false
  if (!event.startTime) return false
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const [sh, sm] = event.startTime.split(':').map(Number)
  return nowMin < sh * 60 + sm
}
