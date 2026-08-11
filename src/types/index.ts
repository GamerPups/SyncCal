export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

export type EventVisibility = 'private' | 'shared'

export type MemberRole = 'owner' | 'editor' | 'viewer'

export type EventReminder =
  | 'none'
  | 'at-time'
  | '5-min'
  | '10-min'
  | '15-min'
  | '30-min'
  | '1-hour'
  | '1-day'

export type EventRecurrence =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'custom'

export type RecurrenceEditScope = 'this' | 'following' | 'series'

/** How an event appears to the current viewer */
export type EventDisplayMode = 'full' | 'busy'

/** A user's private calendar — events here are visible only to the owner. */
export type PersonalCalendar = {
  id: string
  ownerId: string
  name: string
  color: string
}

export type CalendarMember = {
  id: string
  name: string
  color: string
  role: MemberRole
  initials: string
}

/** A household shared calendar with member list and permissions. */
export type SharedCalendar = {
  id: string
  name: string
  members: CalendarMember[]
  inviteCode: string
  createdBy: string
}

export type CalendarInvitation = {
  id: string
  calendarId: string
  calendarName: string
  invitedBy: string
  invitedByName: string
  role: MemberRole
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export type CalendarEvent = {
  id: string
  title: string
  date: string // ISO date YYYY-MM-DD
  startTime: string | null // HH:mm, null for all-day
  endTime: string | null
  allDay: boolean
  location: string
  description: string
  color: string
  visibility: EventVisibility
  reminder: EventReminder
  recurrence: EventRecurrence
  /** Links recurring events in a series */
  seriesId?: string
  /** Dates (YYYY-MM-DD) skipped when expanding recurrence */
  recurrenceExceptions?: string[]
  /** Last date (YYYY-MM-DD) included when expanding recurrence */
  recurrenceEndDate?: string
  /** When true, household members see BUSY instead of details (private events only) */
  shareAvailability: boolean
  /** User who owns/created this event */
  ownerId: string
  /** Set when visibility is 'shared' — which shared calendar */
  sharedCalendarId?: string
  /** Household member associated with this shared event (determines color) */
  memberId?: string
  /** Personal calendar id when visibility is 'private' */
  personalCalendarId?: string
}

export type EventFormData = {
  title: string
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  location: string
  description: string
  visibility: EventVisibility
  reminder: EventReminder
  recurrence: EventRecurrence
  shareAvailability: boolean
  sharedCalendarId: string
}

/** Event as resolved for display to a specific viewer */
export type DisplayEvent = CalendarEvent & {
  displayMode: EventDisplayMode
  displayTitle: string
  /** Original event id when this is an expanded recurrence instance */
  sourceEventId?: string
}

/** Controls which calendars and members are visible in views. */
export type CalendarFilters = {
  showPersonal: boolean
  showShared: boolean
  enabledMemberIds: string[]
}

export type ThemeMode = 'light' | 'dark' | 'system'

export type NavItem = {
  label: string
  path: string
  icon: string
}

export type User = {
  id: string
  name: string
  email: string
  avatarInitials: string
  avatarUrl?: string
}

export type ListCategory = 'groceries' | 'chores' | 'packing' | 'custom'

export type SharedList = {
  id: string
  name: string
  category: ListCategory
  sharedCalendarId: string
  createdBy: string
  createdAt: string
  sortOrder: number
}

export type ListItem = {
  id: string
  listId: string
  title: string
  completed: boolean
  assigneeId: string | null
  dueDate: string | null
  notes: string
  createdBy: string
  createdAt: string
  completedAt: string | null
  completedBy: string | null
  sortOrder: number
}

export type ListItemFormData = {
  title: string
  assigneeId: string
  dueDate: string
  notes: string
}
