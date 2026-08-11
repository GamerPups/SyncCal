import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Calendar,
  Menu,
  Settings,
  Users,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MOBILE_NAV_ITEMS } from '@/config/navigation'
import { useAuth } from '@/hooks/use-auth'

function MobileNavLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ElementType
  label: string
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent',
          isActive ? 'bg-sidebar-accent text-accent-foreground' : 'text-sidebar-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  )
}

function MobileMenuSheet() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const isMoreActive = ['/shared', '/invitations', '/settings', '/menu'].some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
  )

  const close = () => setOpen(false)

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV_ITEMS.map((item) => {
            if (item.path === '/menu') {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => setOpen(true)}
                  className={cn(
                    'flex min-h-[56px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                    isMoreActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-label="More options"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                  <span>More</span>
                </button>
              )
            }

            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={cn(
                  'flex min-h-[56px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="px-0 pb-8">
          <div className="px-4 pb-3 pt-2">
            <h2 className="text-base font-semibold">Menu</h2>
          </div>
          <nav className="flex flex-col gap-0.5 px-3" aria-label="Additional navigation">
            <MobileNavLink to="/shared" icon={Users} label="Shared Calendars" onClick={close} />
            <MobileNavLink to="/invitations" icon={Mail} label="Invitations" onClick={close} />
            <Separator className="my-2" />
            <MobileNavLink to="/settings" icon={Settings} label="Settings" onClick={close} />
          </nav>
          {user && (
          <div className="mt-4 border-t border-sidebar-border px-4 pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.avatarInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

export function MobileNav() {
  return <MobileMenuSheet />
}

export function MobileHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <Calendar className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
      </div>
      <span className="text-lg font-semibold">{title ?? 'SyncCal'}</span>
    </header>
  )
}
