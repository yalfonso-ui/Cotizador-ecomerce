/**
 * Configuración centralizada de la tarjeta de demostración.
 *
 * En modo desarrollo (sin API configurada), el checkout precarga estos
 * datos para que el revisor pueda testear el flujo end-to-end con un
 * solo click. La visa 4242 siempre pasa; cualquier otra BIN dispara
 * un error controlado tipo 'B' para probar la resiliencia del retry.
 *
 * En producción real estos valores NUNCA se muestran — solo se usan
 * cuando DEV_MOCK_ENABLED o PROD_MOCK_ENABLED están activos.
 */

export const DEMO_CARD = Object.freeze({
  number: '4242 4242 4242 4242',
  numberDigits: '4242424242424242',
  name: 'JUAN PEREZ',
  expiry: '12/28',
  cvv: '123'
})

/**
 * Determina si el número de tarjeta (con o sin espacios) corresponde
 * a la tarjeta demo Visa 4242.
 * @param {string} cardNumber
 * @returns {boolean}
 */
export function isDemoVisa(cardNumber) {
  return (cardNumber || '').replace(/\s+/g, '') === DEMO_CARD.numberDigits
}
