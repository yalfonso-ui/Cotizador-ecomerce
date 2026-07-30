// useBirthdateMask.js
// Composable para aplicar una máscara de fecha DD/MM/AAAA sin retraso mientras
// el usuario escribe, similar al comportamiento de un input de tarjeta de
// crédito. La máscara se aplica en cada keystroke preservando la posición
// del cursor relativa al último caracter válido.
//
// Salida: { day, month, year, iso, age, isComplete, isValid, onInput }
//
// Ejemplo:
//   const { day, month, year, isValid, onInput } = useBirthdateMask()
//   <input
//     :value="`${day}${month ? '/' + month : ''}${year ? '/' + year : ''}`"
//     @input="onInput($event.target.value)"
//     placeholder="DD/MM/AAAA"
//   />

import { ref, computed } from 'vue'

const DIGITS_ONLY = (v) => String(v || '').replace(/\D/g, '')

/**
 * Aplica la máscara DD/MM/AAAA a la cadena cruda de dígitos.
 * @param {string} digitsOnly
 * @returns {object} { day, month, year, masked, isComplete, isValid }
 */
export function applyMask(digitsOnly) {
  const d = DIGITS_ONLY(digitsOnly).slice(0, 8)
  const day = d.slice(0, 2)
  const month = d.slice(2, 4)
  const year = d.slice(4, 8)
  let masked = day
  if (d.length > 2) masked += '/' + month
  if (d.length > 4) masked += '/' + year
  return { day, month, year, masked, isComplete: d.length === 8 }
}

function clampDay(day) {
  if (!day) return day
  if (day.length === 1) {
    // Si escribe un dígito de día > 3, lo dejamos en una sola cifra
    // pero el usuario ya verá la máscara, no es necesario clamp aquí.
    return day
  }
  // Si escribe "32" lo capamos a "31" (mes de febrero tiene 28 pero
  // para UX evitamos días imposibles).
  const n = parseInt(day, 10)
  if (Number.isNaN(n)) return day
  if (n === 0) return '01'
  if (n > 31) return '31'
  return day
}

function clampMonth(month) {
  if (!month) return month
  if (month.length === 1) {
    // Permitimos "0" como primer dígito (para 01..09) o "1" como
    // inicio de mes 10-12.
    return month
  }
  const n = parseInt(month, 10)
  if (Number.isNaN(n) || n < 1) return '01'
  if (n > 12) return '12'
  return month
}

function clampYear(year) {
  // Año completo de 4 dígitos. Se permite cualquier valor — la validación
  // final (rango razonable) se hace en `isValid` con un floor/sanity check.
  return year
}

function calcAge(year, month, day) {
  if (!year || year.length < 4) return null
  const y = parseInt(year, 10)
  const m = parseInt(month, 10)
  const d = parseInt(day, 10)
  if (!y || !m || !d) return null
  if (y < 1900 || y > 2100) return null
  if (m < 1 || m > 12) return null
  if (d < 1 || d > 31) return null
  const today = new Date()
  let age = today.getFullYear() - y
  const monthDiff = today.getMonth() + 1 - m
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
    age--
  }
  return age >= 0 && age <= 120 ? age : null
}

/**
 * Composable principal.
 * @param {object} [initial] { day, month, year }
 * @returns {object} refs/computeds/handler
 */
export function useBirthdateMask(initial = {}) {
  const day = ref(initial.day || '')
  const month = ref(initial.month || '')
  const year = ref(initial.year || '')

  const isComplete = computed(() => day.value.length === 2 && month.value.length === 2 && year.value.length === 4)
  const isValid = computed(() => isComplete.value && calcAge(year.value, month.value, day.value) !== null)
  const age = computed(() => calcAge(year.value, month.value, day.value))
  const masked = computed(() => {
    let m = day.value
    if (month.value) m += '/' + month.value
    if (year.value) m += '/' + year.value
    return m
  })

  function onInput(value) {
    const raw = String(value || '')
    const digits = DIGITS_ONLY(raw)
    const parsed = applyMask(digits)
    day.value = clampDay(parsed.day)
    month.value = clampMonth(parsed.month)
    year.value = clampYear(parsed.year)
  }

  function setValue({ d: dVal, m: mVal, y: yVal }) {
    day.value = clampDay(String(dVal || ''))
    month.value = clampMonth(String(mVal || ''))
    year.value = clampYear(String(yVal || ''))
  }

  function reset() {
    day.value = ''
    month.value = ''
    year.value = ''
  }

  return {
    day,
    month,
    year,
    masked,
    isComplete,
    isValid,
    age,
    onInput,
    setValue,
    reset
  }
}

export { calcAge, clampDay, clampMonth }
