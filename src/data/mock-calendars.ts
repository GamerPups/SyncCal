import type { SharedCalendar, CalendarInvitation, CalendarMember } from '@/types'
import { CURRENT_USER } from '@/data/mock-events'

export const INITIAL_SHARED_CALENDARS: SharedCalendar[] = [
  {
    id: 'cal-family',
    name: 'Family',
    inviteCode: 'FAMILY-2026',
    createdBy: CURRENT_USER.id,
    members: [
      {
        id: 'user-ashton',
        name: 'Ashton',
        color: '#4A7C59',
        role: 'owner',
        initials: 'AS',
      },
      {
        id: 'user-mom',
        name: 'Mom',
        color: '#C4785A',
        role: 'editor',
        initials: 'MO',
      },
      {
        id: 'user-dad',
        name: 'Dad',
        color: '#5B8A72',
        role: 'editor',
        initials: 'DA',
      },
    ],
  },
]

export const INITIAL_INVITATIONS: CalendarInvitation[] = [
  {
    id: 'inv-1',
    calendarId: 'cal-grandparents',
    calendarName: 'Grandparents',
    invitedBy: 'user-mom',
    invitedByName: 'Mom',
    role: 'editor',
    status: 'pending',
    createdAt: '2026-08-09',
  },
  {
    id: 'inv-2',
    calendarId: 'cal-soccer',
    calendarName: 'Soccer Team',
    invitedBy: 'user-coach',
    invitedByName: 'Coach Mike',
    role: 'viewer',
    status: 'pending',
    createdAt: '2026-08-10',
  },
]

/** Calendars available to join by code but not yet joined */
export const JOINABLE_CALENDARS: SharedCalendar[] = [
  {
    id: 'cal-grandparents',
    name: 'Grandparents',
    inviteCode: 'GRAND-8X4K',
    createdBy: 'user-mom',
    members: [
      { id: 'user-mom', name: 'Mom', color: '#C4785A', role: 'owner', initials: 'MO' },
      { id: 'user-grandma', name: 'Grandma', color: '#9B7B6A', role: 'editor', initials: 'GR' },
    ],
  },
  {
    id: 'cal-soccer',
    name: 'Soccer Team',
    inviteCode: 'SOCCER-TEAM',
    createdBy: 'user-coach',
    members: [
      { id: 'user-coach', name: 'Coach Mike', color: '#4A6670', role: 'owner', initials: 'CM' },
    ],
  },
]

export const MEMBER_COLORS = [
  '#4A7C59',
  '#C4785A',
  '#5B8A72',
  '#9B7B6A',
  '#4A6670',
  '#8B7355',
  '#6B8F71',
]

export function getAllMembersFromCalendars(calendars: SharedCalendar[]): CalendarMember[] {
  const seen = new Set<string>()
  const members: CalendarMember[] = []
  for (const cal of calendars) {
    for (const member of cal.members) {
      if (!seen.has(member.id)) {
        seen.add(member.id)
        members.push(member)
      }
    }
  }
  return members
}

export function getMemberFromCalendars(
  calendars: SharedCalendar[],
  memberId: string,
): CalendarMember | undefined {
  for (const cal of calendars) {
    const member = cal.members.find((m) => m.id === memberId)
    if (member) return member
  }
  return undefined
}

export function getMembersForCalendar(
  calendars: SharedCalendar[],
  calendarId: string,
): CalendarMember[] {
  return calendars.find((c) => c.id === calendarId)?.members ?? []
}

export function getSharedCalendarById(
  calendars: SharedCalendar[],
  calendarId: string,
): SharedCalendar | undefined {
  return calendars.find((c) => c.id === calendarId)
}

/** @deprecated Use getMemberFromCalendars with calendars array */
export function getMemberById(memberId: string): CalendarMember | undefined {
  return getMemberFromCalendars(INITIAL_SHARED_CALENDARS, memberId)
}

/** @deprecated Use calendars from SharedCalendarsProvider */
export const HOUSEHOLD_MEMBERS = INITIAL_SHARED_CALENDARS[0]?.members ?? []

/** @deprecated Use calendars from SharedCalendarsProvider */
export const SHARED_CALENDARS = INITIAL_SHARED_CALENDARS

export const PERSONAL_CALENDAR = {
  id: 'cal-personal-ashton',
  ownerId: CURRENT_USER.id,
  name: 'My Calendar',
  color: '#4A7C59',
}
