import type { BackendState } from '@/api/types'
import { INITIAL_EVENTS, HOUSEHOLD_PRIVATE_EVENTS } from '@/data/mock-events'
import { INITIAL_SHARED_CALENDARS, INITIAL_INVITATIONS } from '@/data/mock-calendars'
import { INITIAL_SHARED_LISTS, INITIAL_LIST_ITEMS } from '@/data/mock-lists'

const STORE_KEY = 'synccal-backend-store'

function cloneSeedState(): BackendState {
  return {
    events: INITIAL_EVENTS.map((e) => ({ ...e })),
    householdPrivateEvents: HOUSEHOLD_PRIVATE_EVENTS.map((e) => ({ ...e })),
    sharedCalendars: INITIAL_SHARED_CALENDARS.map((c) => ({
      ...c,
      members: c.members.map((m) => ({ ...m })),
    })),
    invitations: INITIAL_INVITATIONS.map((i) => ({ ...i })),
    lists: INITIAL_SHARED_LISTS.map((l) => ({ ...l })),
    listItems: INITIAL_LIST_ITEMS.map((i) => ({ ...i })),
  }
}

export function loadBackendState(): BackendState {
  if (typeof window === 'undefined') return cloneSeedState()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const seed = cloneSeedState()
      localStorage.setItem(STORE_KEY, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw) as BackendState
  } catch {
    const seed = cloneSeedState()
    localStorage.setItem(STORE_KEY, JSON.stringify(seed))
    return seed
  }
}

export function saveBackendState(state: BackendState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORE_KEY, JSON.stringify(state))
}

export function resetBackendState(): BackendState {
  const seed = cloneSeedState()
  saveBackendState(seed)
  return seed
}
