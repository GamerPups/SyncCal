import { useEffect, useMemo, useState } from 'react'
import { MobileHeader } from '@/components/layout/MobileNav'
import { EventListItem } from '@/components/events/EventListItem'
import { useEvents } from '@/hooks/use-events'
import {
  formatEventTimeLabel,
  isEventHappeningNow,
  isEventUpcomingToday,
} from '@/lib/upcoming-utils'
import { cn, formatDateKey } from '@/lib/utils'

function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <p className="font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
      {time}
    </p>
  )
}

export function TodayPage() {
  const { getEventsForDate } = useEvents()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const todayKey = formatDateKey(now)
  const allTodayEvents = getEventsForDate(todayKey)

  const { happeningNow, upcomingLater } = useMemo(() => {
    const happening = allTodayEvents.filter((e) => isEventHappeningNow(e, now))
    const upcoming = allTodayEvents.filter((e) => isEventUpcomingToday(e, now))
    return { happeningNow: happening, upcomingLater: upcoming }
  }, [allTodayEvents, now])

  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex h-full flex-col">
      <MobileHeader title="Today" />

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Date & clock */}
          <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
            <p className="text-sm font-medium text-primary">Today</p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{dateLabel}</h1>
            <div className="mt-4">
              <LiveClock />
            </div>
          </section>

          {/* Happening now */}
          {happeningNow.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Happening now
              </h2>
              <div className="space-y-2">
                {happeningNow.map((event) => (
                  <EventListItem key={event.id} event={event} highlight="now" />
                ))}
              </div>
            </section>
          )}

          {/* Today's schedule */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Today&apos;s events
              {allTodayEvents.length > 0 && (
                <span className="ml-2 font-normal normal-case text-muted-foreground">
                  ({allTodayEvents.length})
                </span>
              )}
            </h2>

            {allTodayEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
                <p className="font-medium text-foreground">Nothing scheduled today</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enjoy your free day, or add something to your calendar.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {allTodayEvents.map((event) => {
                  const isNow = isEventHappeningNow(event, now)
                  const isUpcoming = isEventUpcomingToday(event, now)
                  return (
                    <EventListItem
                      key={event.id}
                      event={event}
                      highlight={isNow ? 'now' : isUpcoming ? 'upcoming' : null}
                    />
                  )
                })}
              </div>
            )}
          </section>

          {/* Coming up next */}
          {upcomingLater.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Coming up next
              </h2>
              <div className="space-y-2">
                {upcomingLater.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2',
                    )}
                  >
                    <span className="shrink-0 text-sm font-medium text-primary">
                      {formatEventTimeLabel(event).split(' – ')[0]}
                    </span>
                    <span className="truncate text-sm text-foreground">{event.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
