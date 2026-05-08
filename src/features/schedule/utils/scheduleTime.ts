import type { ScheduleEvent } from '../types/schedule.types'

export function getDateKey(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return new Date(value).toISOString().slice(0, 10)
}

export function buildLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`)
}

export function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

export function eventsOverlap(
  first: Pick<ScheduleEvent, 'startsAt' | 'endsAt'>,
  second: Pick<ScheduleEvent, 'startsAt' | 'endsAt'>,
) {
  const firstStart = new Date(first.startsAt).getTime()
  const firstEnd = new Date(first.endsAt).getTime()
  const secondStart = new Date(second.startsAt).getTime()
  const secondEnd = new Date(second.endsAt).getTime()

  return firstStart < secondEnd && secondStart < firstEnd
}
