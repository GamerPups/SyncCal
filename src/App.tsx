import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppProviders } from '@/components/providers/AppProviders'
import { PwaShell } from '@/components/pwa/PwaShell'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { WelcomePage } from '@/pages/WelcomePage'
import { CalendarPage } from '@/pages/CalendarPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ListsPage } from '@/pages/ListsPage'
import { ListDetailPage } from '@/pages/ListDetailPage'
import { JoinCalendarPage } from '@/pages/JoinCalendarPage'
import { TodayPage } from '@/pages/TodayPage'
import { UpcomingPage } from '@/pages/UpcomingPage'
import { SearchPage } from '@/pages/SearchPage'

export default function App() {
  return (
    <>
      <PwaShell />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppProviders />}>
            <Route element={<AppLayout />}>
              <Route index element={<CalendarPage />} />
              <Route path="today" element={<TodayPage />} />
              <Route path="upcoming" element={<UpcomingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="join" element={<JoinCalendarPage />} />
              <Route path="lists" element={<ListsPage />} />
              <Route path="lists/:listId" element={<ListDetailPage />} />
              <Route path="invitations" element={<Navigate to="/join" replace />} />
              <Route path="shared" element={<Navigate to="/join" replace />} />
              <Route path="shared/*" element={<Navigate to="/join" replace />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="menu" element={<Navigate to="/join" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  )
}
