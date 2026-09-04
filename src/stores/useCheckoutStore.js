import { defineStore } from 'pinia'
import { useCardValidator } from '@/composables/useCardValidator.js'

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

    // ── Validación delegada a useCardValidator ──
    // El store expone los hints del composable para que la UI los
    // muestre inline (verde/ámbar/rojo según status).
    cardNumberValidation() {
      const validator = useCardValidator()
      return validator.validateNumber(this.cardNumberDigits)
    },
    cardNameValidation() {
      const trimmed = (this.cardName || '').trim()
      if (!trimmed) return { isValid: false, hint: '', status: 'empty' }
      if (trimmed.length < 3) return { isValid: false, hint: 'Mínimo 3 caracteres', status: 'too-short' }
      return { isValid: true, hint: '', status: 'valid' }
    },
    expiryValidation() {
      const validator = useCardValidator()
      return validator.validateExpiry(this.expiryDate)
    },
    cvvValidation() {
      const validator = useCardValidator()
      return validator.validateCvv(this.cvv, this.cardBrand)
    },

    // isValid booleano por campo — para habilitar el botón "Pagar".
    cardNumberValid() {
      const v = this.cardNumberValidation
      return v.status === 'valid'
    },
    cardNameValid() {
      return this.cardNameValidation.isValid
    },
    expiryValid() {
      const v = this.expiryValidation
      return v.status === 'valid'
    },
    cvvValid() {
      return this.cvvValidation.isValid
    },

    // El formulario pasa al checkout si los 4 campos son estructuralmente válidos.
    isFormValid() {
      return this.cardNumberValid && this.cardNameValid && this.expiryValid && this.cvvValid
    },

    // Errores "duros" (solo se muestran tras touched o submit).
    // Antes eran siempre false; ahora sí se activan cuando hay un problema real.
    cardNumberError() {
      const v = this.cardNumberValidation
      return ['wrong-length', 'luhn-fail', 'unknown-brand'].includes(v.status)
    },
    cardNameError() {
      return this.cardNameValidation.status === 'too-short'
    },
    expiryError() {
      const v = this.expiryValidation
      return ['invalid', 'invalid-month', 'expired'].includes(v.status)
    },
    cvvError() {
      return this.cvvValidation.status === 'too-long'
    },

    cardBrand(state) {
      const validator = useCardValidator()
      const digits = state.cardNumber.replace(/\s+/g, '')
      return validator.detectBrand(digits)
    },

    cardBrandLabel() {
      const validator = useCardValidator()
      return validator.getBrandLabel(this.cardBrand)
    },

    expectedCvvLength() {
      const validator = useCardValidator()
      return validator.getExpectedCvvLength(this.cardBrand)
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
