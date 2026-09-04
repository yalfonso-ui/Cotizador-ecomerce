/**
 * useCardValidator — composable para validación de tarjeta de crédito en tiempo real.
 *
 * Centraliza toda la lógica de validación de número, fecha de vencimiento y CVV.
 * Diseñada para integrarse con useCheckoutStore (Pinia) sin acoplar el componente
 * a reglas de negocio específicas.
 *
 * Cobertura:
 *  - Luhn checksum (ISO/IEC 7812-1)
 *  - Detección de marca por BIN (Visa, Mastercard, Amex, Discover, Diners)
 *  - Longitud esperada por marca (13, 14, 15, 16 o 19 dígitos)
 *  - CVV contextual (3 dígitos por defecto, 4 para Amex)
 *  - Expiración: mes 01-12, año no expirado
 *
 * Uso típico:
 *   const { validateNumber, validateCvv, validateExpiry, getExpectedLength }
 *     = useCardValidator()
 *   const result = validateNumber(cardDigits)
 *   if (!result.isValid) { showHint(result.hint) }
 */

const CARD_BRANDS = Object.freeze({
  visa:       { name: 'Visa',       lengths: [13, 16, 19],       cvvLength: 3 },
  mastercard: { name: 'Mastercard', lengths: [16],               cvvLength: 3 },
  amex:       { name: 'Amex',       lengths: [15],               cvvLength: 4 },
  discover:   { name: 'Discover',   lengths: [16, 19],           cvvLength: 3 },
  diners:     { name: 'Diners',     lengths: [14, 16, 19],       cvvLength: 3 }
})

/**
 * Detecta la marca a partir del BIN (primeros dígitos).
 * Solo retorna marca si el BIN tiene la longitud suficiente para ser concluyente
 * (≥4 dígitos). Antes de eso, devuelve null para no dar información falsa.
 */
function detectBrand(digits) {
  if (!digits || digits.length < 2) return null
  const d = digits

  if (/^4/.test(d)) return 'visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'mastercard'
  if (/^3[47]/.test(d)) return 'amex'
  if (/^(6011|65|64[4-9]|622)/.test(d)) return 'discover'
  if (/^(36|30[0-5]|38|39)/.test(d)) return 'diners'
  return null
}

/**
 * Implementación del algoritmo de Luhn (mod 10).
 * Se usa para validar que el número de tarjeta es estructuralmente válido
 * antes de enviarlo al backend.
 */
function isLuhnValid(digits) {
  if (!digits || digits.length < 13) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (Number.isNaN(n)) return false
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function useCardValidator() {
  /**
   * Valida un número de tarjeta completo (sin espacios).
   * Devuelve:
   *  - isValid: true solo si pasa Luhn + longitud de marca
   *  - hint: copy contextual para mostrar al usuario
   *  - brand: marca detectada (o null)
   */
  function validateNumber(rawNumber) {
    const digits = String(rawNumber || '').replace(/\D/g, '')
    if (!digits) {
      return { isValid: false, hint: '', brand: null, status: 'empty' }
    }

    const brand = detectBrand(digits)

    // Estado: el usuario aún no terminó de tipear.
    // No mostramos error, pero tampoco dejamos "validar".
    if (brand && digits.length < CARD_BRANDS[brand].lengths[0]) {
      return {
        isValid: false,
        hint: `Faltan ${CARD_BRANDS[brand].lengths[0] - digits.length} dígitos`,
        brand,
        status: 'incomplete'
      }
    }

    // Marca no reconocida pero el usuario ya tipeó varios dígitos.
    if (!brand && digits.length >= 4) {
      return {
        isValid: false,
        hint: 'Verifica el número de tu tarjeta',
        brand: null,
        status: 'unknown-brand'
      }
    }

    // Marca conocida + longitud OK → validar Luhn.
    if (brand) {
      const expectedLengths = CARD_BRANDS[brand].lengths
      const lengthOk = expectedLengths.includes(digits.length)
      if (!lengthOk) {
        return {
          isValid: false,
          hint: `Una ${CARD_BRANDS[brand].name} tiene ${expectedLengths.join(' o ')} dígitos`,
          brand,
          status: 'wrong-length'
        }
      }
      if (!isLuhnValid(digits)) {
        return {
          isValid: false,
          hint: 'Verifica el número — no es un número de tarjeta válido',
          brand,
          status: 'luhn-fail'
        }
      }
      return { isValid: true, hint: '', brand, status: 'valid' }
    }

    return { isValid: false, hint: '', brand: null, status: 'typing' }
  }

  /**
   * Valida el CVV según la marca detectada.
   * Si no hay marca detectada, asume 3 dígitos (default Visa/MC).
   */
  function validateCvv(rawCvv, brand) {
    const digits = String(rawCvv || '').replace(/\D/g, '')
    if (!digits) return { isValid: false, hint: '', status: 'empty' }

    const expectedLength = brand && CARD_BRANDS[brand]
      ? CARD_BRANDS[brand].cvvLength
      : 3

    if (digits.length < expectedLength) {
      return {
        isValid: false,
        hint: `${expectedLength - digits.length} dígito${expectedLength - digits.length === 1 ? '' : 's'} más`,
        status: 'incomplete'
      }
    }
    if (digits.length > expectedLength) {
      return {
        isValid: false,
        hint: `El código de seguridad de ${brand ? CARD_BRANDS[brand].name : 'tu tarjeta'} tiene ${expectedLength} dígitos`,
        status: 'too-long'
      }
    }
    return { isValid: true, hint: '', status: 'valid' }
  }

  /**
   * Valida fecha de vencimiento en formato MM/AA.
   * Rechaza meses >12, años vencidos y permite hasta fin de mes del año de expiración.
   */
  function validateExpiry(rawExpiry) {
    const cleaned = String(rawExpiry || '').replace(/\D/g, '')
    if (!cleaned) return { isValid: false, hint: '', status: 'empty' }

    if (cleaned.length < 4) {
      return {
        isValid: false,
        hint: 'Falta el año de vencimiento',
        status: 'incomplete'
      }
    }

    const mm = parseInt(cleaned.slice(0, 2), 10)
    const yy = parseInt(cleaned.slice(2, 4), 10)

    if (Number.isNaN(mm) || Number.isNaN(yy)) {
      return { isValid: false, hint: 'Fecha inválida', status: 'invalid' }
    }
    if (mm < 1 || mm > 12) {
      return {
        isValid: false,
        hint: 'El mes debe estar entre 01 y 12',
        status: 'invalid-month'
      }
    }

    // Año completo: 2000 + YY. Comparamos contra fin de mes.
    const fullYear = 2000 + yy
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-indexed
    const expiryMonthEnd = new Date(fullYear, mm, 0, 23, 59, 59) // último día del mes

    if (expiryMonthEnd < now) {
      return {
        isValid: false,
        hint: 'Tu tarjeta está vencida',
        status: 'expired'
      }
    }
    // Aviso suave si vence este mes.
    if (fullYear === currentYear && mm === currentMonth) {
      return {
        isValid: true,
        hint: 'Vence este mes — asegúrate de renovarla',
        status: 'expires-this-month'
      }
    }
    return { isValid: true, hint: '', status: 'valid' }
  }

  /**
   * Devuelve la longitud esperada del CVV según la marca detectada.
   * Útil para mostrar placeholder contextual (CVV de 4 dígitos para Amex).
   */
  function getExpectedCvvLength(brand) {
    if (!brand) return 3
    return CARD_BRANDS[brand]?.cvvLength || 3
  }

  /**
   * Etiqueta humana de la marca para mostrar al usuario.
   */
  function getBrandLabel(brand) {
    if (!brand) return null
    return CARD_BRANDS[brand]?.name || null
  }

  return {
    validateNumber,
    validateCvv,
    validateExpiry,
    detectBrand,
    getExpectedCvvLength,
    getBrandLabel,
    CARD_BRANDS
  }
}