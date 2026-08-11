import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { CalendarView } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatHeaderTitle, getNavigationLabels } from '@/lib/calendar-utils'
import { ViewSwitcher } from './ViewSwitcher'
import { GoToDatePicker } from './GoToDatePicker'

type CalendarHeaderProps = {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onNewEvent: () => void
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onNewEvent,
}: CalendarHeaderProps) {
  const nav = getNavigationLabels(view)

  return (
    <div className="space-y-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onPrevious}
                aria-label={nav.previousAria}
                className="rounded-full border-border shadow-soft"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{nav.previous}</TooltipContent>
          </Tooltip>

          <h1 className="min-w-0 text-center text-base font-semibold tracking-tight sm:text-xl lg:text-2xl">
            <span className="line-clamp-2 sm:line-clamp-1">{formatHeaderTitle(currentDate, view)}</span>
          </h1>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onNext}
                aria-label={nav.nextAria}
                className="rounded-full border-border shadow-soft"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{nav.next}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="rounded-full border-border shadow-soft"
            aria-label="Go to today"
          >
            Today
          </Button>
          <Button
            onClick={onNewEvent}
            size="sm"
            className="hidden gap-2 rounded-full shadow-soft lg:inline-flex"
            aria-label="Create new event"
          >
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <ViewSwitcher view={view} onViewChange={onViewChange} />
        <GoToDatePicker className="w-full sm:w-auto sm:min-w-[160px]" />
      </div>
    </div>
  )
}
