import type { CalendarEvent, CalendarFilters } from '@/types'

/**
 * Apply calendar visibility filters to a list of events.
 * Separated from the store so filtering logic stays testable and backend-ready.
 */
export function applyCalendarFilters(
  events: CalendarEvent[],
  filters: CalendarFilters,
  viewerId?: string,
): CalendarEvent[] {
  return events.filter((event) => {
    if (event.visibility === 'private') {
      const isOwn = viewerId ? event.ownerId === viewerId : true

      if (isOwn) {
        if (!filters.showPersonal) return false
        return true
      }

      if (event.shareAvailability) {
        if (!filters.showShared) return false
        if (viewerId && !filters.enabledMemberIds.includes(event.ownerId)) return false
        return true
      }

      return false
    }

    if (event.visibility === 'shared') {
      if (!filters.showShared) return false
      if (event.memberId && !filters.enabledMemberIds.includes(event.memberId)) {
        return false
      }
      return true
    }

    return true
  })
}
