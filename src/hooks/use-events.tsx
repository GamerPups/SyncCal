import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMemberFromCalendars, getPersonalCalendar } from '@/lib/entities'
import type {
  CalendarEvent,
  DisplayEvent,
  EventFormData,
  PersonalCalendar,
  RecurrenceEditScope,
  SharedCalendar,
  User,
} from '@/types'
import { formatDateKey, parseDateKey } from '@/lib/utils'
import { applyCalendarFilters } from '@/lib/calendar-filters'
import {
  canDeleteEvent,
  canEditEvent,
  resolveEventColor,
} from '@/lib/permissions'
import { useCalendarFilters } from '@/hooks/use-calendar-filters'
import { useSharedCalendars } from '@/hooks/use-shared-calendars'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useAuth } from '@/hooks/use-auth'
import { useBackend } from '@/hooks/use-backend'
import {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
} from '@/config/event-options'
import { expandAllRecurringEvents, generateSeriesId } from '@/lib/recurrence'
import { resolveEventsForViewer, isBusyDisplay } from '@/lib/availability'
import { findEventConflicts, type EventConflict } from '@/lib/conflicts'
import { addDays } from '@/lib/calendar-utils'

function sortEvents(a: CalendarEvent, b: CalendarEvent): number {
  if (a.allDay && !b.allDay) return -1
  if (!a.allDay && b.allDay) return 1
  if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime)
  return 0
}

function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getBaseEventId(id: string): string {
  return id.includes('__') ? id.split('__')[0]! : id
}

export function getOccurrenceDateFromId(id: string): string | null {
  if (!id.includes('__')) return null
  return id.split('__')[1] ?? null
}

export function createEmptyFormData(
  date: Date,
  prefs?: {
    defaultShareAvailability?: boolean
    defaultReminder?: string
    defaultEventVisibility?: 'private' | 'shared'
  },
): EventFormData {
  return {
    title: '',
    date: formatDateKey(date),
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    allDay: false,
    location: '',
    description: '',
    visibility: prefs?.defaultEventVisibility ?? 'private',
    reminder: (prefs?.defaultReminder as EventFormData['reminder']) ?? 'none',
    recurrence: 'none',
    shareAvailability: prefs?.defaultShareAvailability ?? true,
    sharedCalendarId: '',
  }
}

export function createEmptyFormDataWithCalendar(
  date: Date,
  defaultCalendarId: string,
  prefs?: {
    defaultShareAvailability?: boolean
    defaultReminder?: string
    defaultEventVisibility?: 'private' | 'shared'
  },
): EventFormData {
  return {
    ...createEmptyFormData(date, prefs),
    sharedCalendarId: defaultCalendarId,
  }
}

export function eventToFormData(event: CalendarEvent): EventFormData {
  return {
    title: event.title,
    date: event.date,
    startTime: event.startTime ?? DEFAULT_START_TIME,
    endTime: event.endTime ?? DEFAULT_END_TIME,
    allDay: event.allDay,
    location: event.location,
    description: event.description,
    visibility: event.visibility,
    reminder: event.reminder,
    recurrence: event.recurrence,
    shareAvailability: event.shareAvailability,
    sharedCalendarId: event.sharedCalendarId ?? '',
  }
}

export function formDataToEvent(
  form: EventFormData,
  existing: CalendarEvent | undefined,
  calendars: SharedCalendar[],
  currentUserId: string,
  personalCalendar: PersonalCalendar,
): CalendarEvent {
  const isShared = form.visibility === 'shared'
  const member = getMemberFromCalendars(calendars, currentUserId)

  const color = isShared
    ? (member?.color ?? '#C4785A')
    : personalCalendar.color

  const recurrence = form.recurrence
  let seriesId = existing?.seriesId
  if (recurrence !== 'none' && !seriesId) {
    seriesId = generateSeriesId()
  }
  if (recurrence === 'none') {
    seriesId = undefined
  }

  return {
    id: existing?.id ?? generateEventId(),
    title: form.title.trim(),
    date: form.date,
    startTime: form.allDay ? null : form.startTime,
    endTime: form.allDay ? null : form.endTime,
    allDay: form.allDay,
    location: form.location.trim(),
    description: form.description.trim(),
    color,
    visibility: form.visibility,
    reminder: form.reminder,
    recurrence: form.recurrence,
    seriesId,
    recurrenceExceptions: existing?.recurrenceExceptions,
    recurrenceEndDate: existing?.recurrenceEndDate,
    shareAvailability: isShared ? false : form.shareAvailability,
    ownerId: existing?.ownerId ?? currentUserId,
    personalCalendarId: isShared ? undefined : personalCalendar.id,
    sharedCalendarId: isShared ? form.sharedCalendarId : undefined,
    memberId: isShared ? (existing?.memberId ?? currentUserId) : undefined,
  }
}

type EventsContextValue = {
  events: CalendarEvent[]
  personalCalendar: PersonalCalendar
  sharedCalendars: SharedCalendar[]
  currentUser: User
  getEventsForDate: (dateKey: string) => DisplayEvent[]
  getEventsForMonth: (year: number, month: number) => DisplayEvent[]
  getEventsForDateRange: (startKey: string, endKey: string) => DisplayEvent[]
  getVisibleEvents: () => DisplayEvent[]
  canEdit: (event: CalendarEvent) => boolean
  canDelete: (event: CalendarEvent) => boolean
  getEventColor: (event: CalendarEvent) => string
  createEvent: (form: EventFormData) => CalendarEvent
  updateEvent: (id: string, form: EventFormData) => void
  deleteEvent: (id: string) => void
  isFormOpen: boolean
  editingEvent: CalendarEvent | null
  formData: EventFormData
  formError: string | null
  formConflicts: EventConflict[]
  isRecurrenceDialogOpen: boolean
  recurrenceDialogMode: 'edit' | 'delete'
  openCreateForm: (date?: Date) => void
  openEditForm: (event: CalendarEvent | DisplayEvent) => void
  closeForm: () => void
  setFormField: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void
  submitForm: () => boolean
  removeEditingEvent: () => void
  confirmRecurrenceScope: (scope: RecurrenceEditScope) => void
  closeRecurrenceDialog: () => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { state, patch } = useBackend()
  const { filters } = useCalendarFilters()
  const { sharedCalendars } = useSharedCalendars()
  const { preferences } = useUserPreferences()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [householdEvents, setHouseholdEvents] = useState<CalendarEvent[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [formData, setFormData] = useState<EventFormData>(() =>
    createEmptyFormData(new Date(), preferences),
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [isRecurrenceDialogOpen, setIsRecurrenceDialogOpen] = useState(false)
  const [recurrenceDialogMode, setRecurrenceDialogMode] = useState<'edit' | 'delete'>('edit')

  useEffect(() => {
    if (!state) return
    setEvents(state.events.map((e) => ({ ...e })))
    setHouseholdEvents(state.householdPrivateEvents.map((e) => ({ ...e })))
  }, [state])

  const updateEvents = useCallback(
    (updater: (prev: CalendarEvent[]) => CalendarEvent[]) => {
      setEvents((prev) => {
        const next = updater(prev)
        void patch({ events: next })
        return next
      })
    },
    [patch],
  )

  const currentUser = user!
  const personalCalendar = useMemo(() => getPersonalCalendar(currentUser), [currentUser])

  const allStoredEvents = useMemo(
    () => [...events, ...householdEvents],
    [events, householdEvents],
  )

  const expandAndResolve = useCallback(
    (list: CalendarEvent[], rangeStart: string, rangeEnd: string): DisplayEvent[] => {
      const expanded = expandAllRecurringEvents(list, rangeStart, rangeEnd)
      const filtered = applyCalendarFilters(expanded, filters, currentUser.id)
      return resolveEventsForViewer(filtered, currentUser.id, sharedCalendars).sort(sortEvents)
    },
    [filters, sharedCalendars, currentUser.id],
  )

  const getEventsForDate = useCallback(
    (dateKey: string) => expandAndResolve(allStoredEvents, dateKey, dateKey),
    [allStoredEvents, expandAndResolve],
  )

  const getEventsForMonth = useCallback(
    (year: number, month: number) => {
      const monthStr = String(month + 1).padStart(2, '0')
      const prefix = `${year}-${monthStr}`
      const monthEvents = allStoredEvents.filter((e) => {
        if (e.date.startsWith(prefix)) return true
        if (e.recurrence !== 'none') return true
        return false
      })
      const startKey = `${prefix}-01`
      const lastDay = new Date(year, month + 1, 0).getDate()
      const endKey = `${prefix}-${String(lastDay).padStart(2, '0')}`
      return expandAndResolve(monthEvents, startKey, endKey)
    },
    [allStoredEvents, expandAndResolve],
  )

  const getEventsForDateRange = useCallback(
    (startKey: string, endKey: string) => {
      const rangeEvents = allStoredEvents.filter((e) => {
        if (e.date >= startKey && e.date <= endKey) return true
        if (e.recurrence !== 'none') return true
        return false
      })
      return expandAndResolve(rangeEvents, startKey, endKey).sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return sortEvents(a, b)
      })
    },
    [allStoredEvents, expandAndResolve],
  )

  const getVisibleEvents = useCallback(
    () => {
      const today = formatDateKey(new Date())
      const pastStart = formatDateKey(addDays(parseDateKey(today), -365))
      const futureEnd = formatDateKey(addDays(parseDateKey(today), 365))
      return expandAndResolve(allStoredEvents, pastStart, futureEnd).sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        return sortEvents(a, b)
      })
    },
    [allStoredEvents, expandAndResolve],
  )

  const getConflictEventsForDate = useCallback(
    (dateKey: string) =>
      expandAllRecurringEvents(allStoredEvents, dateKey, dateKey),
    [allStoredEvents],
  )

  const formConflicts = useMemo((): EventConflict[] => {
    if (formData.allDay || !isFormOpen) return []
    return findEventConflicts(
      {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        allDay: formData.allDay,
        excludeEventId: editingEvent?.id,
      },
      getConflictEventsForDate(formData.date),
      currentUser.id,
      sharedCalendars,
    )
  }, [formData, editingEvent, isFormOpen, getConflictEventsForDate, sharedCalendars])

  const getEventColor = useCallback(
    (event: CalendarEvent) => resolveEventColor(event, personalCalendar.color, sharedCalendars),
    [personalCalendar.color, sharedCalendars],
  )

  const canEdit = useCallback(
    (event: CalendarEvent) => {
      if ('displayMode' in event && isBusyDisplay(event as DisplayEvent)) return false
      return canEditEvent(currentUser.id, event, sharedCalendars)
    },
    [sharedCalendars],
  )

  const canDelete = useCallback(
    (event: CalendarEvent) => canDeleteEvent(currentUser.id, event, sharedCalendars),
    [sharedCalendars],
  )

  const openCreateForm = useCallback((date?: Date) => {
    setEditingEvent(null)
    setFormData(
      createEmptyFormDataWithCalendar(
        date ?? new Date(),
        sharedCalendars[0]?.id ?? '',
        preferences,
      ),
    )
    setFormError(null)
    setIsFormOpen(true)
  }, [sharedCalendars, preferences])

  const openEditForm = useCallback((event: CalendarEvent | DisplayEvent) => {
    if ('displayMode' in event && isBusyDisplay(event)) return

    const baseId = getBaseEventId(event.id)
    const master = events.find((e) => e.id === baseId) ?? event
    if (!canEditEvent(currentUser.id, master, sharedCalendars)) return

    const occurrenceDate = getOccurrenceDateFromId(event.id)
    setEditingEvent({
      ...master,
      id: event.id,
      date: occurrenceDate ?? master.date,
    })
    setFormData({
      ...eventToFormData(master),
      date: occurrenceDate ?? master.date,
    })
    setFormError(null)
    setIsFormOpen(true)
  }, [events, sharedCalendars])

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingEvent(null)
    setFormError(null)
  }, [])

  const closeRecurrenceDialog = useCallback(() => {
    setIsRecurrenceDialogOpen(false)
  }, [])

  const setFormField = useCallback(
    <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      setFormError(null)
    },
    [],
  )

  const validateForm = (form: EventFormData): string | null => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.date) return 'Date is required.'
    if (!form.allDay) {
      if (form.endTime <= form.startTime) return 'End time must be after start time.'
    }
    if (form.visibility === 'shared' && !form.sharedCalendarId) {
      return 'Please select a shared calendar.'
    }
    return null
  }

  const createEvent = useCallback((form: EventFormData): CalendarEvent => {
    const event = formDataToEvent(
      form,
      undefined,
      sharedCalendars,
      currentUser.id,
      personalCalendar,
    )
    updateEvents((prev) => [...prev, event])
    return event
  }, [sharedCalendars, currentUser.id, personalCalendar, updateEvents])

  const updateEvent = useCallback((id: string, form: EventFormData) => {
    updateEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? formDataToEvent(form, e, sharedCalendars, currentUser.id, personalCalendar)
          : e,
      ),
    )
  }, [sharedCalendars, currentUser.id, personalCalendar, updateEvents])

  const deleteEvent = useCallback((id: string) => {
    updateEvents((prev) => prev.filter((e) => e.id !== id))
  }, [updateEvents])

  const applyRecurrenceEdit = useCallback(
    (scope: RecurrenceEditScope) => {
      if (!editingEvent) return

      const baseId = getBaseEventId(editingEvent.id)
      const master = events.find((e) => e.id === baseId)
      if (!master) return

      const occurrenceDate = editingEvent.date
      const isRecurring = master.recurrence !== 'none'

      if (!isRecurring) {
        updateEvent(baseId, formData)
        closeForm()
        return
      }

      if (scope === 'series') {
        updateEvent(baseId, { ...formData, date: master.date })
        closeForm()
        return
      }

      if (scope === 'this') {
        if (occurrenceDate === master.date) {
          updateEvent(baseId, { ...formData, date: master.date })
        } else {
          updateEvents((prev) => {
            const updated = prev.map((e) =>
              e.id === baseId
                ? {
                    ...e,
                    recurrenceExceptions: [...(e.recurrenceExceptions ?? []), occurrenceDate],
                  }
                : e,
            )
            const oneOff = formDataToEvent(
              { ...formData, recurrence: 'none' },
              undefined,
              sharedCalendars,
              currentUser.id,
              personalCalendar,
            )
            return [...updated, oneOff]
          })
        }
        closeForm()
        return
      }

      if (scope === 'following') {
        const dayBefore = formatDateKey(addDays(parseDateKey(occurrenceDate), -1))
        updateEvents((prev) => {
          const truncated = prev.map((e) =>
            e.id === baseId
              ? {
                  ...e,
                  recurrenceEndDate: dayBefore < master.date ? master.date : dayBefore,
                }
              : e,
          )
          const newSeries = formDataToEvent(
            formData,
            {
              ...master,
              id: generateEventId(),
              recurrenceExceptions: undefined,
              recurrenceEndDate: undefined,
            },
            sharedCalendars,
            currentUser.id,
            personalCalendar,
          )
          return [...truncated, { ...newSeries, seriesId: generateSeriesId() }]
        })
        closeForm()
      }
    },
    [editingEvent, events, formData, sharedCalendars, currentUser.id, personalCalendar, updateEvent, updateEvents, closeForm],
  )

  const applyRecurrenceDelete = useCallback(
    (scope: RecurrenceEditScope) => {
      if (!editingEvent) return

      const baseId = getBaseEventId(editingEvent.id)
      const master = events.find((e) => e.id === baseId)
      if (!master || master.recurrence === 'none') {
        deleteEvent(baseId)
        closeForm()
        return
      }

      const occurrenceDate = editingEvent.date

      if (scope === 'series') {
        deleteEvent(baseId)
        closeForm()
        return
      }

      if (scope === 'this') {
        if (occurrenceDate === master.date) {
          updateEvents((prev) =>
            prev.map((e) =>
              e.id === baseId
                ? {
                    ...e,
                    recurrenceExceptions: [...(e.recurrenceExceptions ?? []), occurrenceDate],
                    date: formatDateKey(addDays(parseDateKey(occurrenceDate), 1)),
                  }
                : e,
            ),
          )
        } else {
          updateEvents((prev) =>
            prev.map((e) =>
              e.id === baseId
                ? {
                    ...e,
                    recurrenceExceptions: [...(e.recurrenceExceptions ?? []), occurrenceDate],
                  }
                : e,
            ),
          )
        }
        closeForm()
        return
      }

      if (scope === 'following') {
        const dayBefore = formatDateKey(addDays(parseDateKey(occurrenceDate), -1))
        updateEvents((prev) =>
          prev.map((e) =>
            e.id === baseId
              ? {
                  ...e,
                  recurrenceEndDate: dayBefore < master.date ? master.date : dayBefore,
                }
              : e,
          ),
        )
        closeForm()
      }
    },
    [editingEvent, events, deleteEvent, updateEvents, closeForm],
  )

  const confirmRecurrenceScope = useCallback(
    (scope: RecurrenceEditScope) => {
      if (recurrenceDialogMode === 'delete') {
        applyRecurrenceDelete(scope)
      } else {
        applyRecurrenceEdit(scope)
      }
      setIsRecurrenceDialogOpen(false)
    },
    [recurrenceDialogMode, applyRecurrenceEdit, applyRecurrenceDelete],
  )

  const needsRecurrenceDialog = useCallback(
    (event: CalendarEvent | null): boolean => {
      if (!event) return false
      const baseId = getBaseEventId(event.id)
      const master = events.find((e) => e.id === baseId)
      return master?.recurrence !== 'none' && master?.recurrence !== undefined
    },
    [events],
  )

  const submitForm = useCallback((): boolean => {
    const error = validateForm(formData)
    if (error) {
      setFormError(error)
      return false
    }
    if (editingEvent) {
      if (!canEditEvent(currentUser.id, editingEvent, sharedCalendars)) {
        setFormError('You do not have permission to edit this event.')
        return false
      }
      if (needsRecurrenceDialog(editingEvent)) {
        setRecurrenceDialogMode('edit')
        setIsRecurrenceDialogOpen(true)
        return false
      }
      updateEvent(getBaseEventId(editingEvent.id), formData)
    } else {
      createEvent(formData)
    }
    closeForm()
    return true
  }, [
    formData,
    editingEvent,
    sharedCalendars,
    needsRecurrenceDialog,
    updateEvent,
    createEvent,
    closeForm,
  ])

  const removeEditingEvent = useCallback(() => {
    if (!editingEvent) return
    if (!canDeleteEvent(currentUser.id, editingEvent, sharedCalendars)) {
      setFormError('You do not have permission to delete this event.')
      return
    }
    if (needsRecurrenceDialog(editingEvent)) {
      setRecurrenceDialogMode('delete')
      setIsRecurrenceDialogOpen(true)
      return
    }
    deleteEvent(getBaseEventId(editingEvent.id))
    closeForm()
  }, [editingEvent, sharedCalendars, needsRecurrenceDialog, deleteEvent, closeForm])

  const value = useMemo(
    () => ({
      events,
      personalCalendar,
      sharedCalendars,
      currentUser,
      getEventsForDate,
      getEventsForMonth,
      getEventsForDateRange,
      getVisibleEvents,
      canEdit,
      canDelete,
      getEventColor,
      createEvent,
      updateEvent,
      deleteEvent,
      isFormOpen,
      editingEvent,
      formData,
      formError,
      formConflicts,
      isRecurrenceDialogOpen,
      recurrenceDialogMode,
      openCreateForm,
      openEditForm,
      closeForm,
      setFormField,
      submitForm,
      removeEditingEvent,
      confirmRecurrenceScope,
      closeRecurrenceDialog,
    }),
    [
      events,
      sharedCalendars,
      getEventsForDate,
      getEventsForMonth,
      getEventsForDateRange,
      getVisibleEvents,
      canEdit,
      canDelete,
      getEventColor,
      createEvent,
      updateEvent,
      deleteEvent,
      isFormOpen,
      editingEvent,
      formData,
      formError,
      formConflicts,
      isRecurrenceDialogOpen,
      recurrenceDialogMode,
      openCreateForm,
      openEditForm,
      closeForm,
      setFormField,
      submitForm,
      removeEditingEvent,
      confirmRecurrenceScope,
      closeRecurrenceDialog,
    ],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within EventsProvider')
  return context
}
