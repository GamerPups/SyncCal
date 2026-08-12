export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type AuthSession = {
  token: string
  user: import('@/types').User
}

export type BackendState = {
  events: import('@/types').CalendarEvent[]
  householdPrivateEvents: import('@/types').CalendarEvent[]
  personalInviteCode: string
  calendarConnections: import('@/types').CalendarConnection[]
  lists: import('@/types').SharedList[]
  listItems: import('@/types').ListItem[]
}
