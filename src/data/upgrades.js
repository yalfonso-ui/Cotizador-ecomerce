export const UPGRADE_OPTIONS = [
  {
    id: 'preexistencias',
    title: 'Preexistencias médicas',
    description: 'Cobertura para condiciones médicas preexistentes declaradas.',
    coverage: 'USD 5,000',
    price: 18.20,
    color: 'rose',
    iconBg: 'bg-rose-100'
  },
  {
    id: 'deportes',
    title: 'Práctica deportiva',
    description: 'Actividades deportivas recreativas y de aventura.',
    coverage: 'USD 10,000',
    price: 14.50,
    color: 'sky',
    iconBg: 'bg-sky-100'
  },
  {
    id: 'futura-mama',
    title: 'Futura mamá',
    description: 'Coberturas especiales para embarazadas hasta semana 32.',
    coverage: 'USD 8,000',
    price: 22.00,
    color: 'pink',
    iconBg: 'bg-pink-100'
  },
  {
    id: 'equipaje-extra',
    title: 'Equipaje extra',
    description: 'Incrementa el límite por pérdida o daño de equipaje.',
    coverage: 'USD 2,500',
    price: 9.80,
    color: 'amber',
    iconBg: 'bg-amber-100'
  },
  {
    id: 'cancelacion-flex',
    title: 'Cancelación flexible',
    description: 'Cancela tu viaje hasta 48h antes sin penalización.',
    coverage: 'Cobertura total',
    price: 12.40,
    color: 'violet',
    iconBg: 'bg-violet-100'
  }
]

const pricesById = Object.fromEntries(UPGRADE_OPTIONS.map(o => [o.id, o.price]))

export function getUpgradePrice(id) {
  return pricesById[id] || 0
}

export function getUpgradesTotal(upgrades) {
  if (!upgrades || typeof upgrades !== 'object') return 0
  const ids = Object.values(upgrades).flat()
  return ids.reduce((sum, id) => sum + getUpgradePrice(id), 0)
}
