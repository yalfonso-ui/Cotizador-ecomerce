import { ref } from 'vue'

/**
 * Hook para detectar el país del usuario por IP.
 *
 * Por defecto usa una simulación (asigna Colombia con un delay realista de 800ms)
 * para que el indicador "Detectando tu país…" sea visible en el selector.
 *
 * Para producción, reemplaza la lógica interna con tu servicio real de
 * geolocalización por IP. Opciones gratuitas con CORS habilitado:
 *   - https://ipapi.co/json/        →  { country_code, country_name }
 *   - https://ipwho.is/             →  { country_code, country }
 *   - https://api.country.is/       →  { country } (solo código)
 *
 * El composable debe devolver un objeto { code, name } donde:
 *   - code: código ISO-3166-alpha-2 (ej. 'CO', 'US', 'ES')
 *   - name: nombre legible del país (ej. 'Colombia')
 */
export function useIpGeolocation() {
  const country = ref(null)
  const isDetecting = ref(false)
  const error = ref(null)

  async function detect() {
    if (isDetecting.value) return
    isDetecting.value = true
    error.value = null
    country.value = null

    try {
      // ── Simulación ──
      // Reemplazar este bloque por la llamada real a la API:
      //
      //   const response = await fetch('https://ipapi.co/json/')
      //   if (!response.ok) throw new Error(`HTTP ${response.status}`)
      //   const data = await response.json()
      //   country.value = { code: data.country_code, name: data.country_name }
      //
      // Simulamos una llamada de red con 800ms de delay para que el
      // usuario perciba el estado de "detectando" en el selector.
      await new Promise(resolve => setTimeout(resolve, 800))
      country.value = { code: 'CO', name: 'Colombia' }
    } catch (err) {
      error.value = err?.message || 'Detection failed'
      country.value = null
    } finally {
      isDetecting.value = false
    }
  }

  return { country, isDetecting, error, detect }
}
