/**
 * Haptic feedback para iOS Taptic Engine y Android Vibration API.
 *
 * - iOS Safari iOS 18+: navigator.vibrate(10) activa Taptic Engine
 * - Android Chrome: navigator.vibrate(10) vibra físicamente
 * - Desktop: no-op (sin error)
 *
 * Usar:
 *   const haptic = useHaptic()
 *   haptic.tap()        // Toque sutil (10ms) — acciones normales
 *   haptic.success()    // Toque medio (20ms x2) — acciones importantes
 *   haptic.error()      // Toque fuerte (50ms) — errores
 */
export function useHaptic() {
  const isSupported = typeof window !== 'undefined' &&
    typeof window.navigator?.vibrate === 'function'

  function vibrate(pattern) {
    if (!isSupported) return
    try {
      window.navigator.vibrate(pattern)
    } catch (e) {
      // Silenciar errores en navegadores que reportan soporte falso
    }
  }

  return {
    tap: () => vibrate(10),
    success: () => vibrate([20, 50, 20]),
    error: () => vibrate(50),
    isSupported
  }
}
