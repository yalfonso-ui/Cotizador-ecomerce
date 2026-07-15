export const UPGRADE_OPTIONS = [
  {
    id: 'preexistencias',
    title: 'Preexistencias',
    description: 'Atención para condiciones médicas que ya tienes declaradas.',
    coverage: 'USD 5,000',
    price: 18.20,
    color: 'rose',
    iconBg: 'bg-rose-100'
  },
  {
    id: 'deportes',
    title: 'Deportes y aventura',
    description: 'Respaldo para ski, surf, trekking y más actividades outdoor.',
    coverage: 'USD 10,000',
    price: 14.50,
    color: 'sky',
    iconBg: 'bg-sky-100'
  },
  {
    id: 'futura-mama',
    title: 'Futura mamá',
    description: 'Acompañamiento médico especializado hasta la semana 32.',
    coverage: 'USD 8,000',
    price: 22.00,
    color: 'pink',
    iconBg: 'bg-pink-100'
  },
  {
    id: 'cancelacion-multicausa',
    title: 'Cancelación multicausa',
    description: 'Reembolso total por cancelación por enfermedad, trabajo, clima o cualquier imprevisto.',
    coverage: 'Cobertura total',
    price: 15.90,
    color: 'blue',
    iconBg: 'bg-blue-100'
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
