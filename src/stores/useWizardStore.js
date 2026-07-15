import { defineStore } from 'pinia'

const STORAGE_KEY = 'wizard_state'
const STATE_TTL_DAYS = 7
const STATE_TTL_MS = STATE_TTL_DAYS * 24 * 60 * 60 * 1000

function createInitialState() {
  return {
    currentStep: 0,
    direction: 'left',
    isPaymentCompleted: false,
    showLanding: true,
    formData: {
      origin: null,
      destination: [],
      dates: { start: null, end: null },
      tripDuration: null,
      travelersCount: 1,
      birthdates: [],
      ages: [],
      selectedPlan: null,
      personalData: { name: '', email: '', phone: '' },
      companions: [],
      travelersInfo: [],
      upgrades: {},
      emergencyContact: { name: '', phone: '', email: '' }
    }
  }
}

export const useWizardStore = defineStore('wizard', {
  state: () => createInitialState(),

  getters: {
    progress: (state) => {
      const total = 8
      return (state.currentStep / (total - 1)) * 100
    },
    canGoBack: (state) => state.currentStep > 0 && state.currentStep < 7,
    hasRoute: (state) => {
      const hasOrigin = state.formData?.origin != null
      const hasDestination = Array.isArray(state.formData?.destination) && state.formData.destination.length > 0
      return hasOrigin && hasDestination
    },
    hasTravelSummary: (state) => {
      const hasOrigin = state.formData?.origin != null
      const hasDestination = Array.isArray(state.formData?.destination) && state.formData.destination.length > 0
      return hasOrigin && hasDestination
    },
    isOnLanding: (state) => state.showLanding === true,
    isOnWizard: (state) => state.showLanding === false,
    isExpired: () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return true
        const parsed = JSON.parse(raw)
        if (!parsed?.savedAt) return true
        return Date.now() - parsed.savedAt > STATE_TTL_MS
      } catch {
        return true
      }
    }
  },

  actions: {
    nextStep(data = {}) {
      const nextData = { ...data }
      if (data.dates?.start && data.dates?.end) {
        const start = new Date(data.dates.start)
        const end = new Date(data.dates.end)
        start.setHours(0, 0, 0, 0)
        end.setHours(0, 0, 0, 0)
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        nextData.tripDuration = days
      }
      this.formData = { ...this.formData, ...nextData }
      this.direction = 'left'
      this.currentStep++
    },

    prevStep() {
      if (this.currentStep > 0) {
        this.direction = 'right'
        this.currentStep--
      }
    },

    goToStep(step) {
      if (step >= 0 && step < 8) {
        this.direction = step < this.currentStep ? 'right' : 'left'
        this.currentStep = step
      }
    },

    completePayment() {
      this.isPaymentCompleted = true
      this.currentStep = 7
      this.$reset()
      this.currentStep = 7
      this.isPaymentCompleted = true
    },

    resetWizard() {
      this.$reset()
    },

    showLandingView() {
      this.showLanding = true
    },

    showWizardView() {
      this.showLanding = false
    },

    clearPersistedState() {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.warn('Failed to clear wizard state:', e)
      }
    }
  },

  persist: {
    key: STORAGE_KEY,
    storage: localStorage,
    paths: ['currentStep', 'direction', 'isPaymentCompleted', 'showLanding', 'formData'],
    serializer: {
      serialize: (state) => {
        return JSON.stringify({
          ...state,
          savedAt: Date.now()
        })
      },
      deserialize: (raw) => {
        try {
          const parsed = JSON.parse(raw)
          if (parsed.savedAt && Date.now() - parsed.savedAt > STATE_TTL_MS) {
            return createInitialState()
          }
          return parsed
        } catch {
          return createInitialState()
        }
      }
    }
  }
})
