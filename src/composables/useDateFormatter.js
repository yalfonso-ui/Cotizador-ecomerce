const formatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

function safeParse(dateVal) {
  if (!dateVal) return null
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal
  }
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
    const [y, m, d] = dateVal.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }
  const d = new Date(dateVal)
  return isNaN(d.getTime()) ? null : d
}

export function formatDate(dateVal) {
  const d = safeParse(dateVal)
  if (!d) return '—'
  return formatter.format(d)
}

export function formatDateRange(start, end) {
  return `${formatDate(start)} — ${formatDate(end)}`
}

export function formatBirthdate(day, month, year) {
  if (!day || !month || !year) return ''
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}
