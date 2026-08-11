import { useMemo } from 'react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { EventListItem } from '@/components/events/EventListItem'
import { useEvents } from '@/hooks/use-events'
import {
  groupEventsByUpcoming,
  getUpcomingEvents,
  UPCOMING_GROUP_LABELS,
  type UpcomingGroup,
} from '@/lib/upcoming-utils'
import { cn } from '@/lib/utils'

const GROUP_ORDER: UpcomingGroup[] = ['today', 'tomorrow', 'this-week', 'later']

export function UpcomingPage() {
  const { getVisibleEvents } = useEvents()
  const today = useMemo(() => new Date(), [])

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(getVisibleEvents(), today),
    [getVisibleEvents, today],
  )

  const grouped = useMemo(
    () => groupEventsByUpcoming(upcomingEvents, today),
    [upcomingEvents, today],
  )

  const hasAnyEvents = upcomingEvents.length > 0

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Upcoming" />

      <div className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="hidden text-2xl font-semibold tracking-tight lg:block">Upcoming</h1>
        <p className="text-sm text-muted-foreground">
          Events from today through the weeks ahead
        </p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {!hasAnyEvents ? (
            <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="font-medium text-foreground">No upcoming events</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your schedule is clear for the foreseeable future.
              </p>
            </div>
          ) : (
            GROUP_ORDER.map((group) => {
              const groupEvents = grouped.get(group) ?? []
              if (groupEvents.length === 0) return null

              const isToday = group === 'today'

              return (
                <section key={group}>
                  <h2
                    className={cn(
                      'mb-3 text-sm font-semibold uppercase tracking-wider',
                      isToday ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {UPCOMING_GROUP_LABELS[group]}
                    <span className="ml-2 font-normal normal-case">
                      ({groupEvents.length})
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {groupEvents.map((event) => (
                      <EventListItem
                        key={event.id}
                        event={event}
                        showDate={group === 'this-week' || group === 'later'}
                      />
                    ))}
                  </div>
                </section>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
