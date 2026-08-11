import type { CalendarEvent, CalendarMember, SharedCalendar, User } from '@/types'
import { getMemberFromCalendars, getMembersForCalendar } from '@/data/mock-calendars'

/**
 * Permission helpers — designed to be replaced by backend enforcement.
 * All checks go through these functions so the API layer can swap in later.
 */

export function isPersonalEvent(event: CalendarEvent): boolean {
  return event.visibility === 'private'
}

export function isSharedEvent(event: CalendarEvent): boolean {
  return event.visibility === 'shared'
}

export function isEventOwner(userId: string, event: CalendarEvent): boolean {
  return event.ownerId === userId
}

export function isCalendarMember(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  const calendar = calendars.find((c) => c.id === calendarId)
  return calendar?.members.some((m) => m.id === userId) ?? false
}

export function canViewEventDetails(
  userId: string,
  event: CalendarEvent,
  calendars: SharedCalendar[],
): boolean {
  if (isPersonalEvent(event)) {
    return isEventOwner(userId, event)
  }
  if (event.sharedCalendarId) {
    return isCalendarMember(userId, event.sharedCalendarId, calendars)
  }
  return false
}

export function canEditEvent(
  userId: string,
  event: CalendarEvent,
  calendars: SharedCalendar[],
): boolean {
  if (isPersonalEvent(event)) {
    return isEventOwner(userId, event)
  }
  if (!event.sharedCalendarId) return false

  const members = getMembersForCalendar(calendars, event.sharedCalendarId)
  const member = members.find((m) => m.id === userId)
  if (!member) return false

  return member.role === 'owner' || member.role === 'editor'
}

export function canDeleteEvent(
  userId: string,
  event: CalendarEvent,
  calendars: SharedCalendar[],
): boolean {
  if (isPersonalEvent(event)) {
    return isEventOwner(userId, event)
  }
  if (!event.sharedCalendarId) return false
  const members = getMembersForCalendar(calendars, event.sharedCalendarId)
  const member = members.find((m) => m.id === userId)
  if (!member) return false
  if (member.role === 'owner') return true
  if (member.role === 'editor') return event.ownerId === userId
  return false
}

export function canManageCalendarMembers(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  const members = getMembersForCalendar(calendars, calendarId)
  const member = members.find((m) => m.id === userId)
  return member?.role === 'owner'
}

export function resolveEventColor(
  event: CalendarEvent,
  personalColor: string,
  calendars: SharedCalendar[],
): string {
  if (isPersonalEvent(event)) return personalColor
  if (event.memberId) {
    return getMemberFromCalendars(calendars, event.memberId)?.color ?? event.color
  }
  return event.color
}

export function getEventMember(
  event: CalendarEvent,
  calendars: SharedCalendar[],
): CalendarMember | undefined {
  if (!event.memberId) return undefined
  return getMemberFromCalendars(calendars, event.memberId)
}

export function getVisibilityLabel(
  event: CalendarEvent,
  currentUser: User,
  calendars: SharedCalendar[],
): string {
  if (isPersonalEvent(event)) {
    return isEventOwner(currentUser.id, event) ? 'Personal' : 'Private'
  }
  const member = getEventMember(event, calendars)
  if (member) return member.name
  return 'Shared'
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Viewer'
    default:
      return role
  }
}

export function getRoleDescription(role: string): string {
  switch (role) {
    case 'owner':
      return 'Full control — manage members, settings, and all events'
    case 'editor':
      return 'Can create, edit, and delete their own events'
    case 'viewer':
      return 'Can view events but cannot make changes'
    default:
      return ''
  }
}
