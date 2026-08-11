import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppProviders } from '@/components/providers/AppProviders'
import { LoginPage } from '@/pages/LoginPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ListsPage } from '@/pages/ListsPage'
import { ListDetailPage } from '@/pages/ListDetailPage'
import { SharedCalendarsPage } from '@/pages/SharedCalendarsPage'
import { SharedCalendarDetailPage } from '@/pages/SharedCalendarDetailPage'
import { InvitationsPage } from '@/pages/InvitationsPage'
import { TodayPage } from '@/pages/TodayPage'
import { UpcomingPage } from '@/pages/UpcomingPage'
import { SearchPage } from '@/pages/SearchPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppProviders />}>
          <Route element={<AppLayout />}>
            <Route index element={<CalendarPage />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="upcoming" element={<UpcomingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="shared" element={<SharedCalendarsPage />} />
            <Route path="shared/:calendarId" element={<SharedCalendarDetailPage />} />
            <Route path="lists" element={<ListsPage />} />
            <Route path="lists/:listId" element={<ListDetailPage />} />
            <Route path="invitations" element={<InvitationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="menu" element={<Navigate to="/shared" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
