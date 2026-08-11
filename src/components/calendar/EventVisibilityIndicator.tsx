import { Lock, Users } from 'lucide-react'
import type { CalendarEvent } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { getPersonalCalendar } from '@/lib/entities'
import {
  getVisibilityLabel,
  isPersonalEvent,
  resolveEventColor,
} from '@/lib/permissions'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { cn } from '@/lib/utils'

type EventVisibilityIndicatorProps = {
  event: CalendarEvent
  compact?: boolean
  className?: string
}

export function EventVisibilityIndicator({
  event,
  compact = false,
  className,
}: EventVisibilityIndicatorProps) {
  const { sharedCalendars } = useSharedCalendars()
  const { user } = useAuth()
  if (!user) return null
  const label = getVisibilityLabel(event, user, sharedCalendars)
  const color = resolveEventColor(event, getPersonalCalendar(user).color, sharedCalendars)
  const isPersonal = isPersonalEvent(event)

  if (compact) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center', className)}
        title={isPersonal ? 'Personal event' : `Shared — ${label}`}
        aria-hidden="true"
      >
        {isPersonal ? (
          <Lock className="h-3 w-3 text-muted-foreground" />
        ) : (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
        isPersonal
          ? 'bg-primary/10 text-primary'
          : 'bg-secondary text-secondary-foreground',
        className,
      )}
    >
      {isPersonal ? (
        <>
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span>Personal</span>
        </>
      ) : (
        <>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <Users className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </span>
  )
}
