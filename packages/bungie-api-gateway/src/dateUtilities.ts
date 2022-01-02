export function getCurrentDailyResetStartDate(): string {
  const dailyReset = getDailyResetDate()
  if (isBeforeDailyReset()) {
    dailyReset.setDate(dailyReset.getDate() - 1)
  }
  return dailyReset.toISOString()
}

export function getCurrentDailyResetEndDate(): string {
  const dailyReset = getDailyResetDate()
  if (!isBeforeDailyReset()) {
    dailyReset.setDate(dailyReset.getDate() + 1)
  }
  return dailyReset.toISOString()
}

export function getDailyResetDate(): Date {
  const date = new Date()
  date.setUTCHours(17)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)
  return date
}

export function isBeforeDailyReset(): boolean {
  const date = new Date()
  const dailyReset = getDailyResetDate()
  return date < dailyReset
}

export function getNextOccuranceOfDay(day: number) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  let daysUntilTargetDay = day - dayOfWeek
  if (
    daysUntilTargetDay < 0 ||
    (daysUntilTargetDay === 0 && !isBeforeDailyReset())
  ) {
    daysUntilTargetDay = 7 + daysUntilTargetDay
  }
  const resetDate = getDailyResetDate()
  resetDate.setDate(today.getDate() + daysUntilTargetDay)
  return resetDate.toISOString()
}

export function getLastWeeklyReset(): string {
  const nextReset = new Date(getNextWeeklyReset())
  nextReset.setDate(nextReset.getDate() - 7)
  return nextReset.toISOString()
}

export function getNextWeeklyReset(): string {
  return getNextOccuranceOfDay(2) //Tuesday
}

export function getLastWeekendReset(): string {
  const nextReset = new Date(getNextWeekendReset())
  nextReset.setDate(nextReset.getDate() - 7)
  return nextReset.toISOString()
}

export function getNextWeekendReset(): string {
  return getNextOccuranceOfDay(5) //Friday
}
