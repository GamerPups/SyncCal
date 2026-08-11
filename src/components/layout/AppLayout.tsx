import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { EventFormDialog } from '@/components/events/EventFormDialog'
import { PwaShell } from '@/components/pwa/PwaShell'

const SEARCH_BAR_ROUTES = ['/', '/today', '/upcoming', '/search']

export function AppLayout() {
  const location = useLocation()
  const showSearchBar = SEARCH_BAR_ROUTES.some(
    (path) => location.pathname === path || location.pathname.startsWith('/search'),
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
        <PwaShell />
        {showSearchBar && <GlobalSearchBar />}
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <EventFormDialog />
    </div>
  )
}
