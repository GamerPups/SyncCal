import { Lock, Users } from 'lucide-react'
import { useCalendarFilters } from '@/hooks/use-calendar-filters'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { useAuth } from '@/hooks/use-auth'
import { getAllMembersFromCalendars, getPersonalCalendar } from '@/lib/entities'
import { cn } from '@/lib/utils'

export function CalendarFilterBar() {
  const { user } = useAuth()
  const { sharedCalendars } = useSharedCalendars()
  const {
    filters,
    togglePersonal,
    toggleShared,
    toggleMember,
    isMemberEnabled,
  } = useCalendarFilters()

  const allMembers = getAllMembersFromCalendars(sharedCalendars)
  if (!user) return null
  const personalCalendar = getPersonalCalendar(user)

  return (
    <div
      className="border-b border-border px-4 py-3 sm:px-6"
      aria-label="Calendar visibility filters"
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Show on calendar
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={filters.showPersonal}
            onClick={togglePersonal}
            color={personalCalendar.color}
            icon={Lock}
            label={personalCalendar.name}
            ariaLabel={`${filters.showPersonal ? 'Hide' : 'Show'} personal calendar`}
          />

          {sharedCalendars.map((cal) => (
            <FilterChip
              key={cal.id}
              active={filters.showShared}
              onClick={toggleShared}
              color="#C4785A"
              icon={Users}
              label={cal.name}
              ariaLabel={`${filters.showShared ? 'Hide' : 'Show'} ${cal.name} calendar`}
            />
          ))}
        </div>

        {allMembers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Household members</p>
            <div className="flex flex-wrap gap-2">
              {allMembers.map((member) => (
                <MemberChip
                  key={member.id}
                  name={member.name}
                  color={member.color}
                  active={isMemberEnabled(member.id)}
                  onClick={() => toggleMember(member.id)}
                  disabled={!filters.showShared}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  color,
  icon: Icon,
  label,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  color: string
  icon: React.ElementType
  label: string
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary/30 bg-accent text-accent-foreground shadow-soft'
          : 'border-border bg-muted/50 text-muted-foreground opacity-60 hover:opacity-100',
      )}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: active ? color : undefined }}
        aria-hidden="true"
      />
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  )
}

function MemberChip({
  name,
  color,
  active,
  onClick,
  disabled,
}: {
  name: string
  color: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={`${active ? 'Hide' : 'Show'} ${name}'s events`}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active && !disabled
          ? 'border-border bg-background text-foreground shadow-soft'
          : 'border-transparent bg-muted/50 text-muted-foreground',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white',
          !active && 'opacity-40',
        )}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        {name.charAt(0)}
      </span>
      <span className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={active}
          readOnly
          tabIndex={-1}
          className="pointer-events-none h-3.5 w-3.5 rounded border-input text-primary"
          aria-hidden="true"
        />
        {name}
      </span>
    </button>
  )
}
