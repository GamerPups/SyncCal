import type { SharedCalendar } from '@/types'
import { getMembersForCalendar } from '@/lib/entities'

function getMemberRole(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): 'owner' | 'editor' | 'viewer' | null {
  const members = getMembersForCalendar(calendars, calendarId)
  const member = members.find((m) => m.id === userId)
  return member?.role ?? null
}

export function canViewList(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return getMemberRole(userId, calendarId, calendars) !== null
}

export function canManageLists(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  const role = getMemberRole(userId, calendarId, calendars)
  return role === 'owner' || role === 'editor'
}

export function canAddListItems(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return canManageLists(userId, calendarId, calendars)
}

export function canEditListItem(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return canManageLists(userId, calendarId, calendars)
}

export function canDeleteListItem(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return canManageLists(userId, calendarId, calendars)
}

/** All calendar members can check items on or off */
export function canToggleListItem(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return canViewList(userId, calendarId, calendars)
}

export function canClearCompleted(
  userId: string,
  calendarId: string,
  calendars: SharedCalendar[],
): boolean {
  return canManageLists(userId, calendarId, calendars)
}
