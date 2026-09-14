import { defineStore } from 'pinia'

const STORAGE_KEY = 'currency_preference'

// Tasas referenciales (en producción vienen de una API FX).
// Editables desde data/currency.js si quieres centralizarlas.
const RATES = {
  USD: 1,
  COP: 4000
}

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    currency: readInitial()
  }),

  getters: {
    rate: (state) => RATES[state.currency] ?? 1,
    isUSD: (state) => state.currency === 'USD',
    isCOP: (state) => state.currency === 'COP',
    symbol: (state) => (state.currency === 'COP' ? 'COP' : 'USD')
  },

  actions: {
    setCurrency(next) {
      if (!RATES[next]) return
      this.currency = next
      try { localStorage.setItem(STORAGE_KEY, next) } catch (_) {}
    },
    toggle() {
      this.setCurrency(this.currency === 'USD' ? 'COP' : 'USD')
    },
    /** Convierte un valor base USD a la moneda activa. */
    convert(amountUSD) {
      return Number(amountUSD) * this.rate
    }
  },

  persist: {
    key: STORAGE_KEY,
    storage: localStorage,
    paths: ['currency']
  }
})

function readInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'USD' || saved === 'COP') return saved
  } catch (_) {}
  return 'USD'
}

/**
 * Formatea un valor en la moneda activa del store.
 * @param {number} amountUSD - valor base en USD.
 * @param {object} store - instancia del store (resultado de useCurrencyStore())
 * @returns {string}
 */
export function formatCurrency(amountUSD, store) {
  const value = store.convert(amountUSD)
  if (store.isUSD) {
    return `USD ${value.toFixed(2)}`
  }
  return `COP ${Math.round(value).toLocaleString('es-CO')}`
}
