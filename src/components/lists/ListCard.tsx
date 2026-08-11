import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { SharedList } from '@/types'
import { getListCategoryConfig } from '@/config/list-options'
import { useSharedLists } from '@/hooks/use-shared-lists'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { cn } from '@/lib/utils'

type ListCardProps = {
  list: SharedList
  className?: string
}

export function ListCard({ list, className }: ListCardProps) {
  const { getProgress } = useSharedLists()
  const { getCalendar } = useSharedCalendars()
  const config = getListCategoryConfig(list.category)
  const Icon = config.icon
  const { completed, total } = getProgress(list.id)
  const calendar = getCalendar(list.sharedCalendarId)
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Link
      to={`/lists/${list.id}`}
      className={cn(
        'flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-soft transition-colors',
        'hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-foreground">{list.name}</h2>
          {calendar && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {calendar.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {total === 0
            ? 'No items yet'
            : `${completed} of ${total} done${pct === 100 ? ' — all complete!' : ''}`}
        </p>
        {total > 0 && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${list.name} progress`}
            />
          </div>
        )}
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}
