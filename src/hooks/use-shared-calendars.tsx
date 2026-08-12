import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  connectionsToSharedCalendars,
  getSharedCalendarById,
} from '@/lib/entities'
import { api, ApiError } from '@/api'
import { useAuth } from '@/hooks/use-auth'
import { useBackend } from '@/hooks/use-backend'
import type { CalendarConnection, MemberRole, SharedCalendar } from '@/types'

function getUserRoleInCalendar(
  calendar: SharedCalendar,
  userId: string,
): MemberRole | null {
  return calendar.members.find((m) => m.id === userId)?.role ?? null
}

type SharedCalendarsContextValue = {
  personalInviteCode: string
  calendarConnections: CalendarConnection[]
  connectedUsers: CalendarConnection[]
  pendingIncoming: CalendarConnection[]
  pendingOutgoing: CalendarConnection[]
  sharedCalendars: SharedCalendar[]
  mySharedCalendars: SharedCalendar[]
  getCalendar: (id: string) => SharedCalendar | undefined
  getUserRole: (calendarId: string) => MemberRole | null
  canManageMembers: (calendarId: string) => boolean
  joinByInviteCode: (code: string) => Promise<{ success: boolean; error?: string; otherUserName?: string }>
  acceptConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>
  declineConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>
  disconnectConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>
  refreshState: () => Promise<void>
}

const SharedCalendarsContext = createContext<SharedCalendarsContextValue | null>(null)

export function SharedCalendarsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { state, refresh } = useBackend()
  const [personalInviteCode, setPersonalInviteCode] = useState('')
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([])

  useEffect(() => {
    if (!state) return
    setPersonalInviteCode(state.personalInviteCode ?? '')
    setCalendarConnections(state.calendarConnections.map((c) => ({ ...c })))
  }, [state])

  const currentUser = user!

  const connectedUsers = useMemo(
    () => calendarConnections.filter((c) => c.status === 'connected'),
    [calendarConnections],
  )

  const pendingIncoming = useMemo(
    () => calendarConnections.filter((c) => c.status === 'pending_incoming'),
    [calendarConnections],
  )

  const pendingOutgoing = useMemo(
    () => calendarConnections.filter((c) => c.status === 'pending_outgoing'),
    [calendarConnections],
  )

  const sharedCalendars = useMemo(
    () => connectionsToSharedCalendars(calendarConnections, currentUser),
    [calendarConnections, currentUser],
  )

  const mySharedCalendars = sharedCalendars

  const refreshState = useCallback(async () => {
    await refresh()
  }, [refresh])

  const getCalendar = useCallback(
    (id: string) => getSharedCalendarById(sharedCalendars, id),
    [sharedCalendars],
  )

  const getUserRole = useCallback(
    (calendarId: string) => {
      const calendar = getSharedCalendarById(sharedCalendars, calendarId)
      if (!calendar) return null
      return getUserRoleInCalendar(calendar, currentUser.id)
    },
    [sharedCalendars, currentUser.id],
  )

  const canManageMembers = useCallback((_calendarId: string) => false, [])

  const joinByInviteCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string; otherUserName?: string }> => {
      const normalized = code.trim().toUpperCase()
      if (!normalized) return { success: false, error: 'Please enter an invite code.' }

      try {
        const result = await api.connections.request(normalized)
        await refreshState()
        return { success: true, otherUserName: result.otherUserName }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to send connection request.'
        return { success: false, error: message }
      }
    },
    [refreshState],
  )

  const acceptConnection = useCallback(
    async (connectionId: string) => {
      try {
        await api.connections.accept(connectionId)
        await refreshState()
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept connection.'
        return { success: false, error: message }
      }
    },
    [refreshState],
  )

  const declineConnection = useCallback(
    async (connectionId: string) => {
      try {
        await api.connections.decline(connectionId)
        await refreshState()
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to decline connection.'
        return { success: false, error: message }
      }
    },
    [refreshState],
  )

  const disconnectConnection = useCallback(
    async (connectionId: string) => {
      try {
        await api.connections.disconnect(connectionId)
        await refreshState()
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to disconnect.'
        return { success: false, error: message }
      }
    },
    [refreshState],
  )

  const value = useMemo(
    () => ({
      personalInviteCode,
      calendarConnections,
      connectedUsers,
      pendingIncoming,
      pendingOutgoing,
      sharedCalendars,
      mySharedCalendars,
      getCalendar,
      getUserRole,
      canManageMembers,
      joinByInviteCode,
      acceptConnection,
      declineConnection,
      disconnectConnection,
      refreshState,
    }),
    [
      personalInviteCode,
      calendarConnections,
      connectedUsers,
      pendingIncoming,
      pendingOutgoing,
      sharedCalendars,
      mySharedCalendars,
      getCalendar,
      getUserRole,
      canManageMembers,
      joinByInviteCode,
      acceptConnection,
      declineConnection,
      disconnectConnection,
      refreshState,
    ],
  )

  return (
    <SharedCalendarsContext.Provider value={value}>
      {children}
    </SharedCalendarsContext.Provider>
  )
}

export function useSharedCalendars() {
  const context = useContext(SharedCalendarsContext)
  if (!context) throw new Error('useSharedCalendars must be used within SharedCalendarsProvider')
  return context
}
