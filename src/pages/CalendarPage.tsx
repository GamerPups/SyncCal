import { Plus } from 'lucide-react'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { DayView } from '@/components/calendar/DayView'
import { AgendaView } from '@/components/calendar/AgendaView'
import { CalendarFilterBar } from '@/components/calendar/CalendarFilterBar'
import { MobileHeader } from '@/components/layout/MobileNav'
import { Button } from '@/components/ui/button'
import { useCalendar } from '@/hooks/use-calendar'
import { useEvents } from '@/hooks/use-events'
import type { CalendarView } from '@/types'

function CalendarViewContent({ view, selectedDate }: { view: CalendarView; selectedDate: Date }) {
  switch (view) {
    case 'month':
      return <MonthView currentDate={selectedDate} />
    case 'week':
      return <WeekView currentDate={selectedDate} />
    case 'day':
      return <DayView currentDate={selectedDate} />
    case 'agenda':
      return <AgendaView currentDate={selectedDate} />
  }
}

export function CalendarPage() {
  const {
    selectedDate,
    view,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
  } = useCalendar()

  const { openCreateForm } = useEvents()

  const handleNewEvent = () => openCreateForm(selectedDate)

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Calendar" />

      <CalendarHeader
        currentDate={selectedDate}
        view={view}
        onViewChange={setView}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
        onNewEvent={handleNewEvent}
      />

      <CalendarFilterBar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CalendarViewContent view={view} selectedDate={selectedDate} />
      </div>

      <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom)+12px)] right-4 z-30 lg:hidden">
        <Button
          size="icon"
          onClick={handleNewEvent}
          className="h-14 w-14 rounded-full shadow-card"
          aria-label="Create new event"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
