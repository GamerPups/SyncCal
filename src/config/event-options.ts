import type { EventRecurrence, EventReminder } from '@/types'

export const REMINDER_OPTIONS: { value: EventReminder; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'at-time', label: 'At event time' },
  { value: '5-min', label: '5 minutes before' },
  { value: '10-min', label: '10 minutes before' },
  { value: '15-min', label: '15 minutes before' },
  { value: '30-min', label: '30 minutes before' },
  { value: '1-hour', label: '1 hour before' },
  { value: '1-day', label: '1 day before' },
]

export const RECURRENCE_OPTIONS: { value: EventRecurrence; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
]

export const PRIVATE_EVENT_COLOR = '#4A7C59'
export const SHARED_EVENT_COLOR = '#C4785A'

export const TIME_OPTIONS: string[] = (() => {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      times.push(
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      )
    }
  }
  return times
})()

export const DEFAULT_START_TIME = '09:00'
export const DEFAULT_END_TIME = '10:00'
