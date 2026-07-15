const LOCALE_TO_COUNTRY = {
  'es-CO': 'CO', 'es-MX': 'MX', 'es-AR': 'AR', 'es-CL': 'CL',
  'es-PE': 'PE', 'es-EC': 'EC', 'es-ES': 'ES', 'es-UY': 'UY',
  'es-VE': 'VE', 'es-DO': 'DO', 'es-GT': 'GT', 'es-HN': 'HN',
  'es-CR': 'CR', 'es-PA': 'PA', 'es-CU': 'CU', 'es-BO': 'BO',
  'es-PY': 'PY', 'es-SV': 'SV', 'es-NI': 'NI', 'es-PR': 'PR',
  'en-US': 'US', 'en-CA': 'CA', 'en-GB': 'GB', 'en-AU': 'AU',
  'en-NZ': 'NZ', 'en-IE': 'IE', 'en-IN': 'IN', 'en-ZA': 'ZA',
  'pt-BR': 'BR', 'pt-PT': 'PT', 'fr-FR': 'FR', 'fr-CA': 'CA',
  'de-DE': 'DE', 'de-AT': 'AT', 'de-CH': 'CH', 'it-IT': 'IT',
  'nl-NL': 'NL', 'nl-BE': 'BE', 'ja-JP': 'JP'
}

export function detectCountryFromLocale(locale) {
  if (!locale || typeof locale !== 'string') return null
  const normalized = locale.replace('_', '-')
  if (LOCALE_TO_COUNTRY[normalized]) return LOCALE_TO_COUNTRY[normalized]
  const base = normalized.split('-')[0]
  for (const key of Object.keys(LOCALE_TO_COUNTRY)) {
    if (key.startsWith(`${base}-`)) return LOCALE_TO_COUNTRY[key]
  }
  return null
}

export function suggestOriginCode(countries) {
  if (typeof navigator === 'undefined') return null
  const raw = (navigator.languages && navigator.languages[0]) || navigator.language || ''
  const code = detectCountryFromLocale(raw)
  if (!code) return null
  return countries.find(c => c.code === code) || null
}