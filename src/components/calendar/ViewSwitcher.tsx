import type { CalendarView } from '@/types'
import { cn } from '@/lib/utils'

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'day', label: 'Day' },
  { value: 'agenda', label: 'Agenda' },
]

type ViewSwitcherProps = {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
}

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shadow-soft"
      role="tablist"
      aria-label="Calendar view"
    >
      {VIEWS.map(({ value, label }) => {
        const isSelected = view === value
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onViewChange(value)}
            className={cn(
              'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              isSelected
                ? 'bg-background text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
