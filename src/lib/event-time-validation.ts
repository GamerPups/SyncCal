/** Returns true when date+time (HH:mm) is before now. */
export function isDateTimeInPast(dateKey: string, time: string, now = new Date()): boolean {
  const [hours, minutes] = time.split(':').map(Number)
  const eventAt = new Date(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10)),
    hours,
    minutes,
    0,
    0,
  )
  return eventAt.getTime() < now.getTime()
}

export type PastTimeWarnings = {
  start: boolean
  end: boolean
}

export function getPastTimeWarnings(
  dateKey: string,
  startTime: string,
  endTime: string,
  now = new Date(),
): PastTimeWarnings {
  return {
    start: isDateTimeInPast(dateKey, startTime, now),
    end: isDateTimeInPast(dateKey, endTime, now),
  }
}
