// usePhoneFormatter.js
// Composable para formateo, parseo y validación de números telefónicos
// internacionales con detección de país por prefijo (default: +57 Colombia).
//
// Uso típico:
//   const { formatted, dialCode, isValid, onPhoneInput } = usePhoneFormatter('+57')
//   <input :value="formatted" @input="onPhoneInput($event.target.value)" />
//
// Salida: el `formatted` siempre tiene el formato legible `+CC NNN NNNN NNNN`
// con espaciado cada 3 dígitos después del código de país, ideal para
// alineación visual y longitud predecible en inputs de tarjeta/formulario.

import { ref } from 'vue'

const COUNTRY_RULES = {
  '1':   { name: 'Estados Unidos / Canadá',  minLen: 10, maxLen: 10 }, // NANP
  '52':  { name: 'México',                   minLen: 10, maxLen: 10 },
  '54':  { name: 'Argentina',                minLen: 10, maxLen: 11 },
  '55':  { name: 'Brasil',                   minLen: 10, maxLen: 11 },
  '56':  { name: 'Chile',                    minLen: 9,  maxLen: 9  },
  '57':  { name: 'Colombia',                 minLen: 10, maxLen: 10 },
  '58':  { name: 'Venezuela',                minLen: 10, maxLen: 10 },
  '51':  { name: 'Perú',                     minLen: 9,  maxLen: 9  },
  '593': { name: 'Ecuador',                  minLen: 9,  maxLen: 9  },
  '34':  { name: 'España',                   minLen: 9,  maxLen: 9  }
}

// Ordena por longitud descendente para que 593 se pruebe antes que 5.
const DIAL_CODES = Object.keys(COUNTRY_RULES).sort((a, b) => b.length - a.length)

const DEFAULT_DIAL = '57'

/**
 * Detecta el código de país a partir de los dígitos ingresados.
 * @param {string} digits
 * @returns {string}
 */
export function detectDialCode(digits) {
  if (!digits) return DEFAULT_DIAL
  for (const code of DIAL_CODES) {
    if (digits.startsWith(code)) return code
  }
  // Cualquier otro prefijo "1X" cae en 1 dígitos para NANP-like.
  if (digits.startsWith('1')) return '1'
  return DEFAULT_DIAL
}

/**
 * Devuelve el nombre legible del país.
 * @param {string} code
 * @returns {string}
 */
export function getCountryName(code) {
  return COUNTRY_RULES[code]?.name || code
}

/**
 * Formatea un número crudo (sólo dígitos, opcional con +) en formato legible.
 * @param {string} raw
 * @returns {string} ej. "+57 320 123 4567"
 */
export function formatPhone(raw) {
  if (!raw) return ''
  const hasPlus = String(raw).trim().startsWith('+')
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return hasPlus ? '+' : ''

  const code = detectDialCode(digits)
  const rule = COUNTRY_RULES[code] || { minLen: 7, maxLen: 15 }
  const local = digits.slice(code.length).slice(0, rule.maxLen)

  // Agrupa en bloques de 3 para legibilidad (3-3-4 / 3-3 / 2-3-4-4).
  const groups = []
  if (local.length <= 3) {
    groups.push(local)
  } else if (local.length <= 6) {
    groups.push(local.slice(0, 3), local.slice(3))
  } else {
    groups.push(local.slice(0, 3), local.slice(3, 6), local.slice(6))
  }

  return `+${code} ${groups.filter(Boolean).join(' ')}`.trim()
}

/**
 * Valida que el número tenga la longitud correcta según el país detectado.
 * @param {string} raw
 * @returns {boolean}
 */
export function isValidPhone(raw) {
  if (!raw) return false
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return false
  const code = detectDialCode(digits)
  const rule = COUNTRY_RULES[code] || { minLen: 7, maxLen: 15 }
  const localLen = digits.length - code.length
  return localLen >= rule.minLen && localLen <= rule.maxLen
}

/**
 * Extrae el código de país a partir del texto formateado.
 * @param {string} raw
 * @returns {string} ej. "57"
 */
export function extractDialCode(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  return detectDialCode(digits)
}

/**
 * Composable: crea refs reactivas listas para `v-model`/`v-bind:value`
 * con manejo de `input` nativo. Mantiene el `+` visible al inicio incluso
 * cuando el usuario borra todo.
 *
 * @param {string} initialDial
 * @returns {object} { formatted, dialCode, countryName, isValid, onPhoneInput, reset }
 */
export function usePhoneFormatter(initialDial = DEFAULT_DIAL) {
  const formatted = ref('')
  const dialCode = ref(initialDial)
  const countryName = ref(getCountryName(initialDial))
  const isValid = ref(false)

  function refreshFromDigits(digits) {
    const code = detectDialCode(digits)
    dialCode.value = code
    countryName.value = getCountryName(code)
    const rule = COUNTRY_RULES[code] || { minLen: 7, maxLen: 15 }
    const local = digits.slice(code.length).slice(0, rule.maxLen)
    const localLen = local.length
    isValid.value = localLen >= rule.minLen && localLen <= rule.maxLen
    return `${code}${local}`
  }

  function onPhoneInput(value) {
    const raw = String(value || '')
    const hasPlus = raw.trim().startsWith('+')
    const digits = raw.replace(/\D/g, '')

    if (!digits) {
      formatted.value = hasPlus ? '+' : ''
      dialCode.value = initialDial
      countryName.value = getCountryName(initialDial)
      isValid.value = false
      return
    }

    const composed = refreshFromDigits(digits)
    formatted.value = formatPhone('+' + composed)
  }

  function setValue(value) {
    onPhoneInput(value)
  }

  function reset() {
    formatted.value = ''
    dialCode.value = initialDial
    countryName.value = getCountryName(initialDial)
    isValid.value = false
  }

  return {
    formatted,
    dialCode,
    countryName,
    isValid,
    onPhoneInput,
    setValue,
    reset
  }
}
