import type { CalendarEvent, SharedCalendar } from '@/types'
import { canViewEventDetails } from '@/lib/permissions'
import { parseTimeToMinutes } from '@/lib/calendar-utils'

export type EventConflict = {
  eventId: string
  /** Privacy-safe label — never reveals private event details */
  label: string
}

export type ConflictCheckInput = {
  date: string
  startTime: string | null
  endTime: string | null
  allDay: boolean
  excludeEventId?: string
}

function getEventTimeRange(event: CalendarEvent): { start: number; end: number } | null {
  if (event.allDay) return { start: 0, end: 24 * 60 }
  if (!event.startTime || !event.endTime) return null
  return {
    start: parseTimeToMinutes(event.startTime),
    end: parseTimeToMinutes(event.endTime),
  }
}

function rangesOverlap(
  a: { start: number; end: number },
  b: { start: number; end: number },
): boolean {
  return a.start < b.end && b.start < a.end
}

/** Returns a privacy-safe label for a conflicting event. */
function getConflictLabel(
  event: CalendarEvent,
  userId: string,
  calendars: SharedCalendar[],
): string {
  if (canViewEventDetails(userId, event, calendars)) {
    return event.title
  }
  return 'Busy'
}

/**
 * Find events that overlap with the proposed time slot.
 * Only includes events the user is allowed to know about.
 */
export function findEventConflicts(
  input: ConflictCheckInput,
  events: CalendarEvent[],
  userId: string,
  calendars: SharedCalendar[],
): EventConflict[] {
  if (input.allDay) return []

  const proposedStart = input.startTime ? parseTimeToMinutes(input.startTime) : null
  const proposedEnd = input.endTime ? parseTimeToMinutes(input.endTime) : null
  if (proposedStart === null || proposedEnd === null) return []

  const proposed = { start: proposedStart, end: proposedEnd }

  const conflicts: EventConflict[] = []

  for (const event of events) {
    if (input.excludeEventId && baseEventId(event.id) === baseEventId(input.excludeEventId)) continue
    if (event.date !== input.date) continue

    const canKnow =
      canViewEventDetails(userId, event, calendars) ||
      (event.visibility === 'private' &&
        event.ownerId !== userId &&
        event.shareAvailability)

    if (!canKnow) continue

    const range = getEventTimeRange(event)
    if (!range) continue
    if (!rangesOverlap(proposed, range)) continue

    conflicts.push({
      eventId: event.id,
      label: getConflictLabel(event, userId, calendars),
    })
  }

  return conflicts
}

export function hasConflicts(
  input: ConflictCheckInput,
  events: CalendarEvent[],
  userId: string,
  calendars: SharedCalendar[],
): boolean {
  return findEventConflicts(input, events, userId, calendars).length > 0
}

function baseEventId(id: string): string {
  return id.includes('__') ? id.split('__')[0]! : id
}
