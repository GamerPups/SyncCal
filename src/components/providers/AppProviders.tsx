import { CalendarProvider } from '@/hooks/use-calendar'
import { CalendarFiltersProvider } from '@/hooks/use-calendar-filters'
import { SharedCalendarsProvider } from '@/hooks/use-shared-calendars'
import { SharedListsProvider } from '@/hooks/use-shared-lists'
import { UserPreferencesProvider } from '@/hooks/use-user-preferences'
import { EventsProvider } from '@/hooks/use-events'
import { BackendProvider } from '@/hooks/use-backend'
import { Outlet } from 'react-router-dom'

/** App data providers — mounted only when authenticated */
export function AppProviders() {
  return (
    <BackendProvider>
      <CalendarProvider>
        <CalendarFiltersProvider>
          <SharedCalendarsProvider>
            <SharedListsProvider>
              <UserPreferencesProvider>
                <EventsProvider>
                  <Outlet />
                </EventsProvider>
              </UserPreferencesProvider>
            </SharedListsProvider>
          </SharedCalendarsProvider>
        </CalendarFiltersProvider>
      </CalendarProvider>
    </BackendProvider>
  )
}
