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
    isMobileSummaryExpanded: false,

    // Total final cobrado (plan base + adicionales - descuento).
    // Se setea al momento del pago exitoso en StepCheckout y se consume
    // en la pantalla final (SuccessStep). No se persiste: si el usuario
    // recarga la página de éxito, este valor se pierde y SuccessStep
    // cae al fallback del precio base del plan.
    finalTotal: 0
  }),

  getters: {
    cardNumberDigits: (state) => state.cardNumber.replace(/\s+/g, ''),

    // Validaciones flexibles: cualquier input con al menos N caracteres
    // cuenta como "lleno" para que el botón "Activar cobertura" se habilite.
    // No se valida formato de tarjeta, mes de expiración ni longitud
    // exacta del CVV — eso lo hace el backend (paymentService).
    cardNumberValid: (state) => {
      const digits = state.cardNumber.replace(/\s+/g, '')
      return digits.length > 0
    },
    cardNameValid: (state) => (state.cardName || '').trim().length > 0,
    expiryValid: (state) => (state.expiryDate || '').replace(/\D/g, '').length > 0,
    cvvValid: (state) => (state.cvv || '').trim().length > 0,

    // El formulario pasa al checkout si los 4 campos no están vacíos.
    isFormValid() {
      return this.cardNumberValid && this.cardNameValid && this.expiryValid && this.cvvValid
    },

    // Ya no se exponen errores de formato (el backend los maneja). Estos
    // getters quedan como `false` por compat con el template, pero
    // nunca se activan en el flujo normal.
    cardNumberError() { return false },
    cardNameError() { return false },
    expiryError() { return false },
    cvvError() { return false },

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

    // Congela el total final cobrado (base + upgrades - descuento) en el
    // momento del pago exitoso. La pantalla final lee este valor para
    // mostrar el monto real, no el precio base del plan.
    setFinalTotal(amount) {
      const v = Number(amount)
      this.finalTotal = isFinite(v) && v >= 0 ? v : 0
    },

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
      this.finalTotal = 0
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
