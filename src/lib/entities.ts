import type { CalendarConnection, CalendarMember, PersonalCalendar, SharedCalendar, SharedList, ListItem, User } from '@/types'

export const MEMBER_COLORS = [
  '#4A7C59',
  '#C4785A',
  '#5B8A72',
  '#9B7B6A',
  '#4A6670',
  '#8B7355',
  '#6B8F71',
]

const PERSONAL_CALENDAR_COLOR = '#4A7C59'

export function getPersonalCalendar(user: User): PersonalCalendar {
  return {
    id: `cal-personal-${user.id}`,
    ownerId: user.id,
    name: 'My Calendar',
    color: PERSONAL_CALENDAR_COLOR,
  }
}

export function connectionToSharedCalendar(
  connection: CalendarConnection,
  currentUser: User,
): SharedCalendar | null {
  if (connection.status !== 'connected') return null

  const selfMember: CalendarMember = {
    id: currentUser.id,
    name: currentUser.name,
    color: MEMBER_COLORS[0],
    role: 'editor',
    initials: currentUser.avatarInitials,
  }

  const otherMember: CalendarMember = {
    id: connection.otherUserId,
    name: connection.otherUserName,
    color: connection.otherUserColor,
    role: 'editor',
    initials: connection.otherUserInitials,
  }

  return {
    id: connection.id,
    name: connection.otherUserName,
    inviteCode: '',
    createdBy: connection.otherUserId,
    members: [selfMember, otherMember],
  }
}

export function connectionsToSharedCalendars(
  connections: CalendarConnection[],
  currentUser: User,
): SharedCalendar[] {
  return connections
    .map((c) => connectionToSharedCalendar(c, currentUser))
    .filter((c): c is SharedCalendar => c !== null)
}

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

export function getListById(lists: SharedList[], id: string): SharedList | undefined {
  return lists.find((l) => l.id === id)
}

export function getItemsForList(items: ListItem[], listId: string): ListItem[] {
  return items
    .filter((i) => i.listId === listId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getListProgress(
  items: ListItem[],
  listId: string,
): { completed: number; total: number } {
  const listItems = items.filter((i) => i.listId === listId)
  return {
    completed: listItems.filter((i) => i.completed).length,
    total: listItems.length,
  }
}
