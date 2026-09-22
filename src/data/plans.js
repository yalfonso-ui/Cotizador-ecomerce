export const PLANS = [
  {
    id: 'lite',
    name: 'Lite',
    price: 19,
    anchorPrice: null,
    coverage: '10,000',
    currency: 'USD',
    description: 'Escapadas cortas',
    features: ['Emergencias médicas', 'Repatriación', 'Asistencia 24/7'],
    recommended: false,
    bestFor: ['mx', 'co', 'pe', 'ec']
  },
  {
    id: 'essential',
    name: 'Essential',
    price: 25,
    anchorPrice: null,
    coverage: '15,000',
    currency: 'USD',
    description: 'Viajes típicos',
    features: ['Todo de Lite', 'Teleconsulta', 'COVID-19'],
    recommended: false,
    bestFor: ['cl', 'ar', 'br']
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 40,
    anchorPrice: 59,
    coverage: '50,000',
    currency: 'USD',
    description: 'Aventureros y nómadas',
    features: ['Todo de Essential', 'Cancelación', 'Equipaje'],
    recommended: true,
    bestFor: ['us', 'ca', 'mx']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 65,
    anchorPrice: 89,
    coverage: '100,000',
    currency: 'USD',
    description: 'Sin preocupaciones',
    features: ['Todo de Explorer', 'Concierge', 'Actividades'],
    recommended: false,
    bestFor: ['es', 'fr', 'it', 'gb', 'de', 'jp']
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 95,
    anchorPrice: 129,
    coverage: '250,000',
    currency: 'USD',
    description: 'VIP',
    features: ['Todo de Premium', 'Asistencia premium', 'Límite sin tope'],
    recommended: false,
    bestFor: ['ch', 'au', 'no']
  }
]

const plansById = Object.fromEntries(PLANS.map(p => [p.id, p]))

export function getPlan(id) {
  return plansById[id] || null
}

export function getPlanPrice(id) {
  return plansById[id]?.price || 0
}

export function getPlanName(id) {
  return plansById[id]?.name || 'Sin plan'
}

export function getPlanCoverage(id) {
  return plansById[id]?.coverage || '0'
}
