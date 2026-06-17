const TRAVELER_TYPE_COUNTS = { solo: 1, pareja: 2, familia: 4, grupo: 6 }

export function getTravelerCount(travelers, travelersCount) {
  if (typeof travelers === 'number') return travelers
  const fromType = TRAVELER_TYPE_COUNTS[travelers] || 0
  const fromCount = travelersCount || 0
  return Math.max(fromType, fromCount) || 1
}

export function isValidDate(day, month, year) {
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) return false
  const currentYear = new Date().getFullYear()
  if (y > currentYear) return false
  const test = new Date(y, m - 1, d)
  return test.getFullYear() === y && test.getMonth() === m - 1 && test.getDate() === d
}

export function calculateAge(day, month, year) {
  if (!isValidDate(day, month, year)) return null
  const d = parseInt(day, 10)
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)
  const today = new Date()
  const birthDate = new Date(y, m - 1, d)
  let age = today.getFullYear() - birthDate.getFullYear()
  const mDiff = today.getMonth() - birthDate.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}
