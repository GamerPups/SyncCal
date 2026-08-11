import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CalendarView } from '@/types'
import { addDays, addMonths, addWeeks } from '@/lib/calendar-utils'

type CalendarContextValue = {
  selectedDate: Date
  view: CalendarView
  setSelectedDate: (date: Date) => void
  setView: (view: CalendarView) => void
  goToToday: () => void
  goToPrevious: () => void
  goToNext: () => void
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [view, setView] = useState<CalendarView>('month')

  const goToToday = () => setSelectedDate(new Date())

  const goToPrevious = () => {
    setSelectedDate((prev) => {
      switch (view) {
        case 'month':
        case 'agenda':
          return addMonths(prev, -1)
        case 'week':
          return addWeeks(prev, -1)
        case 'day':
          return addDays(prev, -1)
      }
    })
  }

  const goToNext = () => {
    setSelectedDate((prev) => {
      switch (view) {
        case 'month':
        case 'agenda':
          return addMonths(prev, 1)
        case 'week':
          return addWeeks(prev, 1)
        case 'day':
          return addDays(prev, 1)
      }
    })
  }

  return (
    <CalendarContext.Provider
      value={{
        selectedDate,
        view,
        setSelectedDate,
        setView,
        goToToday,
        goToPrevious,
        goToNext,
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) throw new Error('useCalendar must be used within CalendarProvider')
  return context
}
