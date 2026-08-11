import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  MEMBER_COLORS,
  getSharedCalendarById,
} from '@/lib/entities'
import { api } from '@/api'
import { useAuth } from '@/hooks/use-auth'
import { useBackend } from '@/hooks/use-backend'
import type {
  CalendarInvitation,
  MemberRole,
  SharedCalendar,
} from '@/types'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function generateInviteCode(name: string): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${slug || 'CAL'}-${suffix}`
}

function getUserRoleInCalendar(
  calendar: SharedCalendar,
  userId: string,
): MemberRole | null {
  return calendar.members.find((m) => m.id === userId)?.role ?? null
}

type SharedCalendarsContextValue = {
  sharedCalendars: SharedCalendar[]
  /** Calendars the current user is still a member of (for sidebar/lists). */
  mySharedCalendars: SharedCalendar[]
  invitations: CalendarInvitation[]
  pendingInvitations: CalendarInvitation[]
  getCalendar: (id: string) => SharedCalendar | undefined
  getUserRole: (calendarId: string) => MemberRole | null
  canManageMembers: (calendarId: string) => boolean
  createCalendar: (name: string) => SharedCalendar
  inviteMember: (calendarId: string, name: string, role: MemberRole) => void
  removeMember: (calendarId: string, memberId: string) => string | null
  updateMemberRole: (calendarId: string, memberId: string, role: MemberRole) => string | null
  leaveCalendar: (calendarId: string) => string | null
  acceptInvitation: (invitationId: string) => Promise<void>
  declineInvitation: (invitationId: string) => void
  joinByInviteCode: (code: string) => Promise<{ success: boolean; error?: string; calendar?: SharedCalendar }>
}

const SharedCalendarsContext = createContext<SharedCalendarsContextValue | null>(null)

export function SharedCalendarsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { state, patch } = useBackend()
  const [sharedCalendars, setSharedCalendars] = useState<SharedCalendar[]>([])
  const [invitations, setInvitations] = useState<CalendarInvitation[]>([])

  useEffect(() => {
    if (!state) return
    setSharedCalendars(state.sharedCalendars.map((c) => ({ ...c, members: c.members.map((m) => ({ ...m })) })))
    setInvitations(state.invitations.map((i) => ({ ...i })))
  }, [state])

  const updateCalendars = useCallback(
    (updater: (prev: SharedCalendar[]) => SharedCalendar[]) => {
      setSharedCalendars((prev) => {
        const next = updater(prev)
        void patch({ sharedCalendars: next })
        return next
      })
    },
    [patch],
  )

  const updateInvitations = useCallback(
    (updater: (prev: CalendarInvitation[]) => CalendarInvitation[]) => {
      setInvitations((prev) => {
        const next = updater(prev)
        void patch({ invitations: next })
        return next
      })
    },
    [patch],
  )

  const currentUser = user!

  const pendingInvitations = useMemo(
    () => invitations.filter((i) => i.status === 'pending'),
    [invitations],
  )

  const mySharedCalendars = useMemo(
    () => sharedCalendars.filter((c) => c.members.some((m) => m.id === currentUser.id)),
    [sharedCalendars, currentUser.id],
  )

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

  const canManageMembers = useCallback(
    (calendarId: string) => getUserRole(calendarId) === 'owner',
    [getUserRole],
  )

  const createCalendar = useCallback((name: string): SharedCalendar => {
    const calendar: SharedCalendar = {
      id: generateId('cal'),
      name: name.trim(),
      inviteCode: generateInviteCode(name),
      createdBy: currentUser.id,
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          color: MEMBER_COLORS[0],
          role: 'owner',
          initials: currentUser.avatarInitials,
        },
      ],
    }
    updateCalendars((prev) => [...prev, calendar])
    return calendar
  }, [user])

  const inviteMember = useCallback(
    (calendarId: string, _name: string, role: MemberRole) => {
      if (role === 'owner') return
      const calendar = getSharedCalendarById(sharedCalendars, calendarId)
      if (!calendar) return

      // Mock: create a pending invitation for the invited person
      const invitation: CalendarInvitation = {
        id: generateId('inv'),
        calendarId,
        calendarName: calendar.name,
        invitedBy: currentUser.id,
        invitedByName: currentUser.name,
        role,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      updateInvitations((prev) => [...prev, invitation])
    },
    [sharedCalendars],
  )

  const removeMember = useCallback(
    (calendarId: string, memberId: string): string | null => {
      const calendar = getSharedCalendarById(sharedCalendars, calendarId)
      if (!calendar) return 'Calendar not found.'
      if (!canManageMembers(calendarId)) return 'Only the owner can remove members.'
      if (memberId === currentUser.id) return 'Use "Leave calendar" to remove yourself.'
      const member = calendar.members.find((m) => m.id === memberId)
      if (!member) return 'Member not found.'
      if (member.role === 'owner') return 'Cannot remove the calendar owner.'

      updateCalendars((prev) =>
        prev.map((c) =>
          c.id === calendarId
            ? { ...c, members: c.members.filter((m) => m.id !== memberId) }
            : c,
        ),
      )
      return null
    },
    [sharedCalendars, canManageMembers],
  )

  const updateMemberRole = useCallback(
    (calendarId: string, memberId: string, role: MemberRole): string | null => {
      const calendar = getSharedCalendarById(sharedCalendars, calendarId)
      if (!calendar) return 'Calendar not found.'
      if (!canManageMembers(calendarId)) return 'Only the owner can change permissions.'
      const member = calendar.members.find((m) => m.id === memberId)
      if (!member) return 'Member not found.'
      if (member.role === 'owner') return 'Cannot change the owner role.'
      if (role === 'owner') return 'Transfer ownership is not yet supported.'

      updateCalendars((prev) =>
        prev.map((c) =>
          c.id === calendarId
            ? {
                ...c,
                members: c.members.map((m) =>
                  m.id === memberId ? { ...m, role } : m,
                ),
              }
            : c,
        ),
      )
      return null
    },
    [sharedCalendars, canManageMembers],
  )

  const leaveCalendar = useCallback(
    (calendarId: string): string | null => {
      const calendar = getSharedCalendarById(sharedCalendars, calendarId)
      if (!calendar) return 'Calendar not found.'
      const role = getUserRoleInCalendar(calendar, currentUser.id)
      if (!role) return 'You are not a member of this calendar.'
      if (role === 'owner') return 'Owners must transfer ownership before leaving.'

      updateCalendars((prev) => prev.filter((c) => c.id !== calendarId))
      return null
    },
    [sharedCalendars],
  )

  const acceptInvitation = useCallback(
    async (invitationId: string) => {
      const invitation = invitations.find((i) => i.id === invitationId)
      if (!invitation || invitation.status !== 'pending') return

      let remoteCalendar: SharedCalendar | null = null
      try {
        const result = await api.calendars.findById(invitation.calendarId)
        remoteCalendar = result.calendar
      } catch {
        remoteCalendar = null
      }

      const colorIndex = sharedCalendars.length % MEMBER_COLORS.length

      updateCalendars((prev) => {
        const existing = prev.find((c) => c.id === invitation.calendarId)
        if (existing) {
          if (existing.members.some((m) => m.id === currentUser.id)) return prev
          return prev.map((c) =>
            c.id === invitation.calendarId
              ? {
                  ...c,
                  members: [
                    ...c.members,
                    {
                      id: currentUser.id,
                      name: currentUser.name,
                      color: MEMBER_COLORS[colorIndex],
                      role: invitation.role,
                      initials: currentUser.avatarInitials,
                    },
                  ],
                }
              : c,
          )
        }

        if (remoteCalendar) {
          return [
            ...prev,
            {
              ...remoteCalendar,
              members: [
                ...remoteCalendar.members,
                {
                  id: currentUser.id,
                  name: currentUser.name,
                  color: MEMBER_COLORS[colorIndex],
                  role: invitation.role,
                  initials: currentUser.avatarInitials,
                },
              ],
            },
          ]
        }

        return prev
      })

      updateInvitations((prev) =>
        prev.map((i) =>
          i.id === invitationId ? { ...i, status: 'accepted' as const } : i,
        ),
      )
    },
    [invitations, sharedCalendars, user],
  )

  const declineInvitation = useCallback((invitationId: string) => {
    updateInvitations((prev) =>
      prev.map((i) =>
        i.id === invitationId ? { ...i, status: 'declined' as const } : i,
      ),
    )
  }, [])

  const joinByInviteCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string; calendar?: SharedCalendar }> => {
      const normalized = code.trim().toUpperCase()
      if (!normalized) return { success: false, error: 'Please enter an invite code.' }

      const existing = sharedCalendars.find(
        (c) => c.inviteCode.toUpperCase() === normalized,
      )
      if (existing) {
        if (existing.members.some((m) => m.id === currentUser.id)) {
          return { success: false, error: 'You are already a member of this calendar.' }
        }
        const colorIndex = existing.members.length % MEMBER_COLORS.length
        const updated = {
          ...existing,
          members: [
            ...existing.members,
            {
              id: currentUser.id,
              name: currentUser.name,
              color: MEMBER_COLORS[colorIndex],
              role: 'editor' as MemberRole,
              initials: currentUser.avatarInitials,
            },
          ],
        }
        updateCalendars((prev) =>
          prev.map((c) => (c.id === existing.id ? updated : c)),
        )
        return { success: true, calendar: updated }
      }

      try {
        const { calendar: joinable } = await api.calendars.findByInviteCode(normalized)
        const colorIndex = joinable.members.length % MEMBER_COLORS.length
        const newCalendar: SharedCalendar = {
          ...joinable,
          members: [
            ...joinable.members,
            {
              id: currentUser.id,
              name: currentUser.name,
              color: MEMBER_COLORS[colorIndex],
              role: 'editor',
              initials: currentUser.avatarInitials,
            },
          ],
        }
        updateCalendars((prev) => [...prev, newCalendar])
        return { success: true, calendar: newCalendar }
      } catch {
        return { success: false, error: 'Invalid invite code. Please check and try again.' }
      }
    },
    [sharedCalendars, user],
  )

  const value = useMemo(
    () => ({
      sharedCalendars,
      mySharedCalendars,
      invitations,
      pendingInvitations,
      getCalendar,
      getUserRole,
      canManageMembers,
      createCalendar,
      inviteMember,
      removeMember,
      updateMemberRole,
      leaveCalendar,
      acceptInvitation,
      declineInvitation,
      joinByInviteCode,
    }),
    [
      sharedCalendars,
      mySharedCalendars,
      invitations,
      pendingInvitations,
      getCalendar,
      getUserRole,
      canManageMembers,
      createCalendar,
      inviteMember,
      removeMember,
      updateMemberRole,
      leaveCalendar,
      acceptInvitation,
      declineInvitation,
      joinByInviteCode,
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
