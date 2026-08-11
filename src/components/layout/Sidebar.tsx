import { NavLink } from 'react-router-dom'
import { CalendarDays, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'
import { PERSONAL_CALENDAR } from '@/data/mock-calendars'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'

function NavItem({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-sidebar-accent text-accent-foreground'
            : 'text-sidebar-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { user } = useAuth()
  const { sharedCalendars, pendingInvitations } = useSharedCalendars()

  if (!user) return null

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <CalendarDays className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">SyncCal</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Main navigation">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} icon={item.icon} label={item.label} />
        ))}

        <div className="mt-4 space-y-2 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            My Calendars
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PERSONAL_CALENDAR.color }}
                aria-hidden="true"
              />
              <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{PERSONAL_CALENDAR.name}</span>
            </div>
            {sharedCalendars.map((cal) => (
              <NavLink
                key={cal.id}
                to={`/shared/${cal.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  )
                }
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#C4785A]" aria-hidden="true" />
                <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{cal.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 py-2">
        <Separator className="mb-2" />
        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavItem key={item.path} to={item.path} icon={item.icon} label={item.label} />
        ))}
        {pendingInvitations.length > 0 && (
          <NavLink
            to="/invitations"
            className="mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary"
          >
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {pendingInvitations.length}
            </span>
            <span>Pending invites</span>
          </NavLink>
        )}
      </div>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{user.avatarInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
