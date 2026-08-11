import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CalendarFilters } from '@/types'
import { HOUSEHOLD_MEMBERS } from '@/data/mock-calendars'

const STORAGE_KEY = 'synccal-calendar-filters'

const DEFAULT_FILTERS: CalendarFilters = {
  showPersonal: true,
  showShared: true,
  enabledMemberIds: HOUSEHOLD_MEMBERS.map((m) => m.id),
}

function loadFilters(): CalendarFilters {
  if (typeof window === 'undefined') return DEFAULT_FILTERS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_FILTERS
    const parsed = JSON.parse(stored) as CalendarFilters
    return {
      showPersonal: parsed.showPersonal ?? true,
      showShared: parsed.showShared ?? true,
      enabledMemberIds: parsed.enabledMemberIds ?? DEFAULT_FILTERS.enabledMemberIds,
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

type CalendarFiltersContextValue = {
  filters: CalendarFilters
  togglePersonal: () => void
  toggleShared: () => void
  toggleMember: (memberId: string) => void
  setShowPersonal: (show: boolean) => void
  setShowShared: (show: boolean) => void
  isMemberEnabled: (memberId: string) => boolean
}

const CalendarFiltersContext = createContext<CalendarFiltersContextValue | null>(null)

export function CalendarFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<CalendarFilters>(loadFilters)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  const togglePersonal = useCallback(() => {
    setFilters((prev) => ({ ...prev, showPersonal: !prev.showPersonal }))
  }, [])

  const toggleShared = useCallback(() => {
    setFilters((prev) => ({ ...prev, showShared: !prev.showShared }))
  }, [])

  const toggleMember = useCallback((memberId: string) => {
    setFilters((prev) => {
      const enabled = prev.enabledMemberIds.includes(memberId)
      return {
        ...prev,
        enabledMemberIds: enabled
          ? prev.enabledMemberIds.filter((id) => id !== memberId)
          : [...prev.enabledMemberIds, memberId],
      }
    })
  }, [])

  const setShowPersonal = useCallback((show: boolean) => {
    setFilters((prev) => ({ ...prev, showPersonal: show }))
  }, [])

  const setShowShared = useCallback((show: boolean) => {
    setFilters((prev) => ({ ...prev, showShared: show }))
  }, [])

  const isMemberEnabled = useCallback(
    (memberId: string) => filters.enabledMemberIds.includes(memberId),
    [filters.enabledMemberIds],
  )

  const value = useMemo(
    () => ({
      filters,
      togglePersonal,
      toggleShared,
      toggleMember,
      setShowPersonal,
      setShowShared,
      isMemberEnabled,
    }),
    [filters, togglePersonal, toggleShared, toggleMember, setShowPersonal, setShowShared, isMemberEnabled],
  )

  return (
    <CalendarFiltersContext.Provider value={value}>
      {children}
    </CalendarFiltersContext.Provider>
  )
}

export function useCalendarFilters() {
  const context = useContext(CalendarFiltersContext)
  if (!context) throw new Error('useCalendarFilters must be used within CalendarFiltersProvider')
  return context
}
