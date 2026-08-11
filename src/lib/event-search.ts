import type { CalendarEvent } from '@/types'
import { getMemberFromCalendars } from '@/data/mock-calendars'

export type SearchFilters = {
  query: string
  personal: boolean
  shared: boolean
  memberId: string
  dateFrom: string
  dateTo: string
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: '',
  personal: true,
  shared: true,
  memberId: 'all',
  dateFrom: '',
  dateTo: '',
}

export function searchEvents<T extends CalendarEvent>(
  events: T[],
  filters: SearchFilters,
  calendars: Parameters<typeof getMemberFromCalendars>[0],
): T[] {
  const query = filters.query.trim().toLowerCase()
  const hasQuery = query.length > 0
  const hasDateFilter = filters.dateFrom !== '' || filters.dateTo !== ''

  if (!hasQuery && !hasDateFilter) return []

  return events.filter((event) => {
    if (!filters.personal && event.visibility === 'private') return false
    if (!filters.shared && event.visibility === 'shared') return false

    if (filters.memberId !== 'all' && event.memberId !== filters.memberId) {
      if (event.visibility === 'shared') return false
    }

    if (filters.dateFrom && event.date < filters.dateFrom) return false
    if (filters.dateTo && event.date > filters.dateTo) return false

    if (!hasQuery) return true

    const haystack = [
      event.title,
      event.description,
      event.location,
      event.memberId
        ? getMemberFromCalendars(calendars, event.memberId)?.name ?? ''
        : '',
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function hasActiveSearch(filters: SearchFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    !filters.personal ||
    !filters.shared ||
    filters.memberId !== 'all'
  )
}
