// Dates are 'YYYY-MM-DD' strings in the user's own timezone (sent by the
// browser as X-Timezone), so "today" matches the user's clock, not the server's.

export function userToday(req) {
  const tz = req.headers['x-timezone']
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(new Date())
  }
}

const toUTC = (d) => new Date(`${d}T00:00:00Z`)
const fmt = (date) => date.toISOString().slice(0, 10)

export function addDays(d, n) {
  const date = toUTC(d)
  date.setUTCDate(date.getUTCDate() + n)
  return fmt(date)
}

// Monday of the week containing d
export function weekStart(d) {
  const dow = (toUTC(d).getUTCDay() + 6) % 7
  return addDays(d, -dow)
}

export function dayLabel(d) {
  return toUTC(d).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}
