export const STEPS = {
  ROUTE: 0,
  CATEGORY: 1,
  DATES: 2,
  TRAVELERS: 3,
  PLANS: 4,
  DATA: 5,
  UPGRADES: 6,
  CHECKOUT: 7,
  SUCCESS: 8
}

export const STEP_LABELS = {
  [STEPS.ROUTE]: 'Ruta',
  [STEPS.CATEGORY]: 'Categoría',
  [STEPS.DATES]: 'Fechas',
  [STEPS.TRAVELERS]: 'Viajeros',
  [STEPS.PLANS]: 'Plan',
  [STEPS.DATA]: 'Datos',
  [STEPS.UPGRADES]: 'Upgrades',
  [STEPS.CHECKOUT]: 'Pago',
  [STEPS.SUCCESS]: 'Confirmado'
}

// Límites de días por categoría (para validación de fechas)
export const CATEGORY_DATE_BOUNDS = {
  short_trips: { minDays: 3, maxDays: 120 },
  long_stays: { minDays: 60, maxDays: 365 },
  students: { minDays: 15, maxDays: 365 },
  annual_multitrip: { minDays: 1, maxDays: 365 }
}

export const TOTAL_STEPS = 9
