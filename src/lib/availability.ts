import type { CalendarEvent, DisplayEvent, SharedCalendar } from '@/types'
import { canViewEventDetails } from '@/lib/permissions'
import { getMemberFromCalendars } from '@/data/mock-calendars'

const BUSY_COLOR = '#9CA3AF'

/**
 * Resolve how an event should appear to a specific viewer.
 * Private events from other members may show as BUSY blocks.
 */
export function resolveEventForViewer(
  event: CalendarEvent,
  viewerId: string,
  calendars: SharedCalendar[],
): DisplayEvent | null {
  const isOwner = event.ownerId === viewerId

  if (event.visibility === 'private' && !isOwner) {
    if (!event.shareAvailability) return null
    return toBusyDisplay(event, calendars)
  }

  if (!canViewEventDetails(viewerId, event, calendars) && !isOwner) {
    if (event.shareAvailability) return toBusyDisplay(event, calendars)
    return null
  }

  return {
    ...event,
    displayMode: 'full',
    displayTitle: event.title,
  }
}

function toBusyDisplay(
  event: CalendarEvent,
  calendars: SharedCalendar[],
): DisplayEvent {
  const member = getMemberFromCalendars(calendars, event.ownerId)
  return {
    ...event,
    title: 'BUSY',
    location: '',
    description: '',
    displayMode: 'busy',
    displayTitle: 'BUSY',
    color: member?.color ?? BUSY_COLOR,
  }
}

export function resolveEventsForViewer(
  events: CalendarEvent[],
  viewerId: string,
  calendars: SharedCalendar[],
): DisplayEvent[] {
  const resolved: DisplayEvent[] = []
  for (const event of events) {
    const display = resolveEventForViewer(event, viewerId, calendars)
    if (display) resolved.push(display)
  }
  return resolved
}

export function isBusyDisplay(event: DisplayEvent): boolean {
  return event.displayMode === 'busy'
}
