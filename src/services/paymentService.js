/**
 * Servicio de pago.
 *
 * Configura la URL del endpoint en .env:
 *   VITE_PAYMENT_API_URL=https://api.tu-dominio.com/v1/payments
 *
 * La API debe responder con un JSON que incluya al menos:
 *   - transactionId (string)
 *   - redirectUrl  (string, ruta interna como '/confirmacion-pago' — opcional)
 *   - voucherCode  (string, opcional)
 *
 * En caso de error, devuelve { success: false, errorCode, message }.
 *
 * ── Dev mode ──
 * Si estás corriendo `npm run dev` y NO has configurado VITE_PAYMENT_API_URL,
 * el servicio simula un pago exitoso después de 1.5s. Esto te permite probar
 * el flujo completo (incluyendo la página de confirmación) sin necesidad de
 * montar un mock server. En producción (vite build / preview) el dev mode
 * está desactivado y la API real es requerida.
 */

const PAYMENT_API_URL = import.meta.env.VITE_PAYMENT_API_URL
const IS_DEV = import.meta.env.DEV
const HAS_API = Boolean(PAYMENT_API_URL)
const DEV_MOCK_ENABLED = IS_DEV && !HAS_API

// Timeout duro para evitar que un fetch colgado deje al usuario con
// el overlay de "Procesando…" para siempre.
const REQUEST_TIMEOUT_MS = 15000

/**
 * @typedef {Object} PaymentPayload
 * @property {string} cardNumber  - Solo dígitos, sin espacios
 * @property {string} cardName   - Nombre del titular
 * @property {string} expiry     - Formato MM/AA
 * @property {string} cvv        - Código de seguridad
 * @property {Object} order      - Resumen de la orden (plan, fechas, viajeros, etc.)
 */

/**
 * @typedef {Object} PaymentResult
 * @property {boolean} success
 * @property {string}  [transactionId]
 * @property {string}  [redirectUrl]   - Ruta interna para SPA navigation
 * @property {string}  [voucherCode]
 * @property {string}  [errorCode]     - 'A' (rechazada), 'B' (datos), 'TIMEOUT', 'NETWORK'
 * @property {string}  [message]
 */

/**
 * Envía el pago a la API.
 *
 * NOTA DE SEGURIDAD: el CVV viaja en el body solo para que el procesador
 * lo valide. La API NO debe persistirlo en ningún log ni base de datos
 * (cumplimiento PCI-DSS).
 *
 * @param {PaymentPayload} payload
 * @returns {Promise<PaymentResult>}
 */
export async function processPayment(payload) {
  // ── Dev mode sin API configurada: simular éxito ──
  // Solo se activa con `npm run dev` y sin VITE_PAYMENT_API_URL.
  if (DEV_MOCK_ENABLED) {
    console.info('[paymentService] Dev mode activo — simulando pago exitoso')
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      success: true,
      transactionId: `dev_${Date.now()}`,
      redirectUrl: '/confirmacion-pago',
      voucherCode: `DEV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    }
  }

  // ── Producción sin API configurada: error de configuración ──
  if (!PAYMENT_API_URL) {
    return {
      success: false,
      errorCode: 'CONFIG',
      message: 'API de pago no configurada. Contacta al administrador.'
    }
  }

  // ── Flujo real: fetch al endpoint configurado ──
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(PAYMENT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        errorCode: response.status === 402 ? 'A' : 'B',
        message: response.statusText || 'Error al procesar el pago'
      }
    }

    const data = await response.json()
    return {
      success: true,
      transactionId: data.transactionId || data.id,
      redirectUrl: data.redirectUrl || '/confirmacion-pago',
      voucherCode: data.voucherCode
    }
  } catch (err) {
    clearTimeout(timeoutId)

    if (err?.name === 'AbortError') {
      return {
        success: false,
        errorCode: 'TIMEOUT',
        message: 'La solicitud tardó demasiado. Inténtalo de nuevo.'
      }
    }

    return {
      success: false,
      errorCode: 'NETWORK',
      message: err?.message || 'Error de red'
    }
  }
}
