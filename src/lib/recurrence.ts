import type { CalendarEvent, EventRecurrence } from '@/types'
import { addDays, addMonths } from '@/lib/calendar-utils'
import { formatDateKey, parseDateKey } from '@/lib/utils'

const MAX_EXPANSION_DAYS = 365

export function generateSeriesId(): string {
  return `series-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function shouldIncludeOccurrence(date: Date, recurrence: EventRecurrence, anchor: Date): boolean {
  if (recurrence === 'none') return false

  const anchorKey = formatDateKey(anchor)
  const dateKey = formatDateKey(date)
  if (dateKey < anchorKey) return false

  switch (recurrence) {
    case 'daily':
      return true
    case 'weekly':
      return date.getDay() === anchor.getDay()
    case 'monthly':
      return date.getDate() === anchor.getDate()
    case 'yearly':
      return date.getMonth() === anchor.getMonth() && date.getDate() === anchor.getDate()
    case 'custom':
      return date.getDay() === anchor.getDay()
    default:
      return false
  }
}

/**
 * Expands a recurring event into individual occurrences within a date range.
 * Non-recurring events are returned as-is.
 */
export function expandRecurringEvent(
  event: CalendarEvent,
  rangeStart: string,
  rangeEnd: string,
): CalendarEvent[] {
  if (event.recurrence === 'none') {
    if (event.date >= rangeStart && event.date <= rangeEnd) return [event]
    return []
  }

  const anchor = parseDateKey(event.date)
  const start = parseDateKey(rangeStart)
  const end = parseDateKey(rangeEnd)
  const occurrences: CalendarEvent[] = []

  let current = new Date(start)
  let daysChecked = 0

  while (current <= end && daysChecked < MAX_EXPANSION_DAYS) {
    if (shouldIncludeOccurrence(current, event.recurrence, anchor)) {
      const dateKey = formatDateKey(current)
      if (dateKey >= rangeStart && dateKey <= rangeEnd && dateKey >= event.date) {
        if (event.recurrenceExceptions?.includes(dateKey)) continue
        if (event.recurrenceEndDate && dateKey > event.recurrenceEndDate) continue
        occurrences.push({
          ...event,
          id: `${event.id}__${dateKey}`,
          date: dateKey,
        })
      }
    }
    current = addDays(current, 1)
    daysChecked++
  }

  return occurrences
}

export function expandAllRecurringEvents(
  events: CalendarEvent[],
  rangeStart: string,
  rangeEnd: string,
): CalendarEvent[] {
  const expanded: CalendarEvent[] = []
  for (const event of events) {
    expanded.push(...expandRecurringEvent(event, rangeStart, rangeEnd))
  }
  return expanded
}

export function getRecurrenceLabel(recurrence: EventRecurrence): string {
  switch (recurrence) {
    case 'none':
      return 'Does not repeat'
    case 'daily':
      return 'Repeats daily'
    case 'weekly':
      return 'Repeats weekly'
    case 'monthly':
      return 'Repeats monthly'
    case 'yearly':
      return 'Repeats yearly'
    case 'custom':
      return 'Custom repeat'
  }
}

/** Count future occurrences to materialize when creating a series. */
export function getOccurrenceDates(
  anchorDate: string,
  recurrence: EventRecurrence,
  count: number,
): string[] {
  if (recurrence === 'none') return [anchorDate]

  const anchor = parseDateKey(anchorDate)
  const dates: string[] = []
  let current = new Date(anchor)

  while (dates.length < count) {
    if (shouldIncludeOccurrence(current, recurrence, anchor)) {
      dates.push(formatDateKey(current))
    }
    current = addDays(current, 1)
    if (formatDateKey(current) > formatDateKey(addMonths(anchor, 24))) break
  }

  return dates
}
