import { defineStore } from 'pinia'

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    // Non-sensitive (persisted)
    appliedDiscount: null,

    // Sensitive (NOT persisted — cleared on refresh)
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cardNumberTouched: false,
    cardNameTouched: false,
    expiryTouched: false,
    cvvTouched: false,
    submitAttempted: false,

    // UI state (NOT persisted)
    isProcessing: false,
    processingStep: '',
    paymentError: null,
    isMobileSummaryExpanded: false
  }),

  getters: {
    cardNumberDigits: (state) => state.cardNumber.replace(/\s+/g, ''),

    cardNumberValid: (state) => {
      const digits = state.cardNumber.replace(/\s+/g, '')
      return digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits)
    },

    cardNameValid: (state) => state.cardName.replace(/\s+/g, '').length >= 3,

    expiryValid: (state) => {
      const m = state.expiryDate.match(/^(\d{2})\/(\d{2})$/)
      if (!m) return false
      const month = parseInt(m[1], 10)
      return month >= 1 && month <= 12
    },

    cvvValid: (state) => /^\d{3,4}$/.test(state.cvv),

    isFormValid() {
      return this.cardNumberValid && this.cardNameValid && this.expiryValid && this.cvvValid
    },

    cardNumberError() {
      return (this.cardNumberTouched || this.submitAttempted) && !this.cardNumberValid
    },
    cardNameError() {
      return (this.cardNameTouched || this.submitAttempted) && !this.cardNameValid
    },
    expiryError() {
      return (this.expiryTouched || this.submitAttempted) && !this.expiryValid
    },
    cvvError() {
      return (this.cvvTouched || this.submitAttempted) && !this.cvvValid
    },

    cardBrand(state) {
      const digits = state.cardNumber.replace(/\s+/g, '')
      if (!digits) return null
      if (/^4/.test(digits)) return 'visa'
      if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard'
      if (/^3[47]/.test(digits)) return 'amex'
      if (/^(6011|65|64[4-9]|622)/.test(digits)) return 'discover'
      if (/^(36|30[0-5]|38|39)/.test(digits)) return 'diners'
      return null
    }
  },

  actions: {
    setCardNumber(value) {
      const raw = String(value).replace(/\D/g, '').slice(0, 19)
      this.cardNumber = raw.match(/.{1,4}/g)?.join(' ') || raw
    },
    setCardName(value) { this.cardName = value },
    setExpiryDate(value) {
      const raw = String(value).replace(/\D/g, '').slice(0, 4)
      if (raw.length <= 2) {
        this.expiryDate = raw
      } else {
        this.expiryDate = raw.slice(0, 2) + '/' + raw.slice(2, 4)
      }
    },
    setCvv(value) { this.cvv = String(value).replace(/\D/g, '').slice(0, 4) },

    touchCardNumber() { this.cardNumberTouched = true },
    touchCardName() { this.cardNameTouched = true },
    touchExpiry() { this.expiryTouched = true },
    touchCvv() { this.cvvTouched = true },

    applyDiscount(discount) { this.appliedDiscount = discount },
    removeDiscount() { this.appliedDiscount = null },

    setProcessing(value) { this.isProcessing = value },
    setProcessingStep(step) { this.processingStep = step },
    setPaymentError(error) { this.paymentError = error },
    setMobileSummaryExpanded(value) { this.isMobileSummaryExpanded = value },

    markAllTouched() {
      this.cardNumberTouched = true
      this.cardNameTouched = true
      this.expiryTouched = true
      this.cvvTouched = true
      this.submitAttempted = true
    },

    resetForm() {
      this.cardNumber = ''
      this.cardName = ''
      this.expiryDate = ''
      this.cvv = ''
      this.cardNumberTouched = false
      this.cardNameTouched = false
      this.expiryTouched = false
      this.cvvTouched = false
      this.submitAttempted = false
      this.isProcessing = false
      this.processingStep = ''
      this.paymentError = null
    },

    resetInteractionFlags() {
      this.cardNumberTouched = false
      this.cardNameTouched = false
      this.expiryTouched = false
      this.cvvTouched = false
      this.submitAttempted = false
      this.paymentError = null
    }
  },

  persist: {
    key: 'checkout_state',
    storage: localStorage,
    // Only persist the non-sensitive appliedDiscount
    paths: ['appliedDiscount']
  }
})
