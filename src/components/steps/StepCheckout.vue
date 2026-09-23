<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import DiscountCodeField from '@/components/ui/DiscountCodeField.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'
import AppAlert from '@/components/ui/AppAlert.vue'

import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { getPlanPrice as planPrice, getPlanName as planName, getPlanCoverage as planCoverage } from '@/data/plans.js'
import { getUpgradesTotal } from '@/data/upgrades.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { useCurrencyStore, formatCurrency } from '@/stores/useCurrencyStore.js'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'
import { showToast } from '@/composables/useToast.js'
import { useHaptic } from '@/composables/useHaptic.js'
import { STEPS } from '@/composables/useWizardSteps.js'
import { processPayment } from '@/services/paymentService.js'
import TravelSummaryPanel from '@/components/ui/TravelSummaryPanel.vue'

const emit = defineEmits(['go-to-step'])

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

// ── Scroll-into-view on focus (mobile) ──
function scrollIntoViewOnFocus(e) {
  if (window.matchMedia('(max-width: 767px)').matches) {
    requestAnimationFrame(() => {
      e.target.scrollIntoView({ behavior: 'instant', block: 'center' })
    })
  }
}

const checkoutStore = useCheckoutStore()
const wizardStore = useWizardStore()
const fx = useCurrencyStore()
function fmt(usd) { return formatCurrency(usd, fx) }
const haptic = useHaptic()
const {
  cardNumber,
  cardName,
  expiryDate,
  cvv,
  cardNumberTouched,
  cardNameTouched,
  expiryTouched,
  cvvTouched,
  submitAttempted,
  isProcessing,
  processingStep,
  paymentError,
  appliedDiscount
} = storeToRefs(checkoutStore)

const {
  cardNumberDigits,
  cardNumberValid,
  cardNameValid,
  expiryValid,
  cvvValid,
  isFormValid,
  cardNumberError,
  cardNameError,
  expiryError,
  cvvError,
  cardBrand,
  cardBrandLabel,
  expectedCvvLength,
  cardNumberValidation,
  cardNameValidation,
  expiryValidation,
  cvvValidation
} = storeToRefs(checkoutStore)

const router = useRouter()

// Cola de timers para los steps progresivos ("Procesando…", "Activando…").
// Hay que limpiarlos cuando el API responde o el componente se desmonta,
// si no quedan vivos y pisan el texto "Redirigiendo…" después del éxito.
const stepTimers = []

function clearStepTimers() {
  while (stepTimers.length) {
    clearTimeout(stepTimers.shift())
  }
}

function getPlanPrice() {
  return planPrice(props.data?.selectedPlan)
}

function getPlanName() {
  return planName(props.data?.selectedPlan)
}

function getPlanCoverage() {
  return planCoverage(props.data?.selectedPlan)
}

function formatDate(date) {
  return fmtDate(date)
}

function formatDestination(dest) {
  if (Array.isArray(dest)) return dest.map(d => d?.name || d).join(', ')
  if (typeof dest === 'object' && dest?.name) return dest.name
  return dest || 'No especificado'
}

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  clearStepTimers()
})

onMounted(() => {
  checkoutStore.resetInteractionFlags()
  // Defensa: si el usuario navegó fuera del checkout durante un pago
  // (ej. clic en back del navegador) y volvió, isProcessing puede estar
  // atascado en true. Lo reseteamos para que el botón no quede
  // permanentemente disabled.
  if (checkoutStore.isProcessing) {
    checkoutStore.setProcessing(false)
    checkoutStore.setProcessingStep('')
  }
})

// cardBrandLabel ahora viene del store (getter) — ver destructuring arriba.

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  return (getPlanPrice() * appliedDiscount.value.discountPercent) / 100
})

const totalViajeros = computed(() => {
  const arr = props.data?.travelersInfo
  if (Array.isArray(arr) && arr.length > 0) return arr.length
  return resolveCount(props.data?.travelers, props.data?.travelersCount)
})

const travelersLabel = computed(() => {
  const n = totalViajeros.value
  if (!n || n < 1) return '—'
  return `${n} ${n === 1 ? 'viajero' : 'viajeros'}`
})

const upgradesTotal = computed(() => getUpgradesTotal(props.data?.upgrades))

const finalPrice = computed(() => {
  return Math.max(0, (getPlanPrice() - discountAmount.value) + upgradesTotal.value)
})

function onCardNumberInput(e) {
  checkoutStore.setCardNumber(e.target.value)
}

function onCardNumberBlur() {
  checkoutStore.touchCardNumber()
}

function onExpiryInput(e) {
  checkoutStore.setExpiryDate(e.target.value)
}

function onExpiryBlur() {
  checkoutStore.touchExpiry()
}

function onCvvInput(e) {
  checkoutStore.setCvv(e.target.value)
}

function onCvvBlur() {
  checkoutStore.touchCvv()
}

function onCardNameInput(e) {
  checkoutStore.setCardName(e.target.value)
}

function onCardNameBlur() {
  checkoutStore.touchCardName()
}

function handleApplyDiscount(discount) {
  checkoutStore.applyDiscount(discount)
}

function handleRemoveDiscount() {
  checkoutStore.removeDiscount()
}

async function handleSubmit() {
  if (isProcessing.value) return
  checkoutStore.setPaymentError(null)
  checkoutStore.markAllTouched()

  if (!isFormValid.value) {
    haptic.error()
    showToast('Revisa los datos de pago para finalizar tu compra', { variant: 'error', duration: 3000 })
    return
  }
  haptic.success()
  processPaymentFlow()
}

function handleRetryPayment() {
  if (isProcessing.value) return
  checkoutStore.setPaymentError(null)
  // Llamada directa al flujo sin re-marcar touched (los campos ya están completos).
  processPaymentFlow()
}

function clearDemoCardData() {
  checkoutStore.cardNumber = ''
  checkoutStore.cardName = ''
  checkoutStore.expiryDate = ''
  checkoutStore.cvv = ''
  checkoutStore.cardNumberTouched = true // esconde el banner demo
  nextTick(() => document.getElementById('card-number')?.focus())
}

async function processPaymentFlow() {
  if (isProcessing.value) return

  // Iniciar flujo: el overlay global (ProcessingOverlay en GlobalLayout)
  // toma el control de la pantalla para evitar parpadeo de UI.
  checkoutStore.setProcessing(true)
  checkoutStore.setProcessingStep('Validando tu tarjeta…')

  // Steps progresivos (UX feedback mientras la API procesa).
  stepTimers.push(setTimeout(() => {
    checkoutStore.setProcessingStep('Procesando tu pago…')
  }, 400))
  stepTimers.push(setTimeout(() => {
    checkoutStore.setProcessingStep('Activando tu cobertura…')
  }, 900))

  try {
    const payload = {
      cardNumber: checkoutStore.cardNumberDigits,
      cardName: checkoutStore.cardName,
      expiry: checkoutStore.expiryDate,
      cvv: checkoutStore.cvv,
      order: {
        plan: props.data?.selectedPlan,
        origin: props.data?.origin,
        destination: props.data?.destination,
        dates: props.data?.dates,
        travelers: props.data?.travelersInfo
      }
    }

    const result = await processPayment(payload)

    if (!result.success) {
      // Mapeo de errores para mostrar el mensaje correcto:
      //   'A' | 'B'  → error de tarjeta (datos o rechazo del banco)
      //   'TIMEOUT'  → conexión lenta, retry sugerido
      //   'NETWORK'  → sin conexión, retry sugerido
      //   'CONFIG'   → error de sistema, contactar soporte
      //   cualquier otro → 'SYSTEM' (genérico)
      const recoverable = ['A', 'B', 'TIMEOUT', 'NETWORK', 'SYSTEM', 'CONFIG']
      const errorCode = recoverable.includes(result.errorCode) ? result.errorCode : 'SYSTEM'
      checkoutStore.setPaymentError(errorCode)
      return
    }

    // ── Pago OK ──
    clearStepTimers()
    checkoutStore.setProcessingStep('Redirigiendo…')

    // Pequeño delay para que el usuario vea el mensaje final
    await new Promise(resolve => setTimeout(resolve, 350))

    // Limpiar estado antes de navegar
    wizardStore.clearPersistedState()
    checkoutStore.resetInteractionFlags()

    // Navegación con fallback: router.replace primero, router.push si falla.
    // Si ambas fallan, el usuario verá un error (no quedará pegado).
    const redirectTo = result.redirectUrl || '/confirmacion-pago'
    let navOk = false
    try {
      await router.replace(redirectTo)
      navOk = true
    } catch (navErr) {
      console.warn('[StepCheckout] router.replace falló, intentando push:', navErr)
      try {
        await router.push(redirectTo)
        navOk = true
      } catch (pushErr) {
        console.error('[StepCheckout] Ambas navegaciones fallaron:', pushErr)
      }
    }

    if (!navOk) {
      checkoutStore.setPaymentError('SYSTEM')
    }
  } catch (err) {
    // Catch-all para errores inesperados (no debería llegar aquí en flujo normal,
    // pero garantiza que el overlay se cierre pase lo que pase).
    console.error('[StepCheckout] Error inesperado en handleSubmit:', err)
    checkoutStore.setPaymentError('SYSTEM')
  } finally {
    // ── Cleanup garantizado ──
    // SIEMPRE se ejecuta: limpia timers, apaga el overlay, resetea el step.
    // Si la navegación tarda o falla, el overlay se cierra igual y el usuario
    // ve la página actual (o la nueva, si la navegación funcionó).
    clearStepTimers()
    checkoutStore.setProcessing(false)
    checkoutStore.setProcessingStep('')
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-5 px-4 sm:px-6 pt-6 md:pt-10">

    <!-- ── Resumen de viaje mobile (unificado via TravelSummaryPanel) ── -->
    <TravelSummaryPanel @go-to-step="emit('go-to-step', $event)" />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

      <section class="lg:col-span-7 space-y-4">
        <header class="space-y-2 text-center">
          <span class="ds-eyebrow">Último paso</span>
          <h1 class="ds-heading-1">Confirma tu <span style="color: #43D3FF;">pago</span></h1>
        </header>

        <div class="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm" :class="submitAttempted && !isFormValid ? 'border-red-200' : ''">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: rgba(67, 211, 255, 0.12);">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style="color: #43D3FF;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-800">Tu método de pago</h3>
          </div>

          <!-- Banner de modo demo: tarjeta Visa precargada -->
          <div
            v-if="!cardNumberTouched"
            class="flex items-center gap-2 p-2.5 rounded-lg text-xs"
            style="background-color: rgba(67, 211, 255, 0.1); color: #00184C;"
            role="note"
            aria-live="polite"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="flex-1 font-bold">Demo · Visa 4242 precargada — cambia cualquier dato para probar error.</span>
            <button
              type="button"
              @click="clearDemoCardData"
              class="text-[11px] font-bold underline shrink-0 hover:opacity-80"
            >Limpiar</button>
          </div>

          <div>
            <label for="card-number" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
              Número de tarjeta
            </label>
            <div class="relative">
              <input
                id="card-number"
                :value="cardNumber"
                @input="onCardNumberInput"
                @blur="onCardNumberBlur"
                @focus="scrollIntoViewOnFocus"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="1234 5678 9012 3456"
                maxlength="23"
                autocomplete="cc-number"
                :aria-invalid="cardNumberTouched && cardNumberError"
                :aria-describedby="cardNumberTouched && (cardNumberError || cardNumberValidation?.hint) ? 'card-number-hint' : undefined"
                class="w-full h-12 px-4 pr-16 sm:pr-20 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-sm sm:text-base tracking-normal sm:tracking-wider"
                :class="[
                  cardNumberTouched && cardNumberError ? 'border-red-300 ring-4 ring-red-50' :
                  cardNumberValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' :
                  'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15'
                ]"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span
                  v-if="cardBrandLabel"
                  class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                  aria-live="polite"
                >
                  {{ cardBrandLabel }}
                </span>
                <span
                  v-if="cardBrand"
                  class="inline-flex items-center justify-center w-7 h-5 rounded text-[10px] font-bold text-white shrink-0"
                  :class="{
                    'bg-[#1A1F71]': cardBrand === 'visa',
                    'bg-[#EB001B]': cardBrand === 'mastercard',
                    'bg-[#006FCF]': cardBrand === 'amex',
                    'bg-[#FF6000]': cardBrand === 'discover',
                    'bg-[#0079BE]': cardBrand === 'diners'
                  }"
                  aria-hidden="true"
                >
                  {{ cardBrand === 'mastercard' ? 'MC' : cardBrand === 'amex' ? 'AX' : cardBrand === 'discover' ? 'DS' : cardBrand === 'diners' ? 'DC' : 'V' }}
                </span>
              </div>
            </div>
            <!-- Hint contextual (success: marca detectada / warning: faltan dígitos / error: luhn/longitud) -->
            <p
              v-if="cardNumberTouched && cardNumberValidation?.hint"
              id="card-number-hint"
              class="text-xs mt-1 flex items-center gap-1.5"
              :class="cardNumberError ? 'text-red-500' : cardNumberValid ? 'text-emerald-600' : 'text-amber-600'"
              role="status"
              aria-live="polite"
            >
              <svg
                v-if="!cardNumberError && !cardNumberValid"
                class="w-3 h-3 shrink-0"
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
              </svg>
              {{ cardNumberValidation.hint }}
            </p>
          </div>

          <div>
            <label for="card-name" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
              Nombre del titular
            </label>
            <input
              id="card-name"
              :value="cardName"
              @input="onCardNameInput"
              @blur="onCardNameBlur"
              @focus="scrollIntoViewOnFocus"
              type="text"
              placeholder="Como aparece en tu tarjeta"
              autocomplete="cc-name"
              :aria-invalid="cardNameTouched && cardNameError"
              class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 text-base placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none"
              :class="[
                cardNameTouched && cardNameError ? 'border-red-300 ring-4 ring-red-50' :
                cardNameValid && cardName.length > 0 ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' :
                'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15'
              ]"
            />
            <p
              v-if="cardNameTouched && cardNameValidation?.hint"
              class="text-xs mt-1 text-red-500 flex items-center gap-1.5"
              role="status"
              aria-live="polite"
            >
              {{ cardNameValidation.hint }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="card-expiry" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Vencimiento
              </label>
              <input
                id="card-expiry"
                :value="expiryDate"
                @input="onExpiryInput"
                @blur="onExpiryBlur"
                @focus="scrollIntoViewOnFocus"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="MM/AA"
                maxlength="5"
                autocomplete="cc-exp"
                :aria-invalid="expiryTouched && expiryError"
                :aria-describedby="expiryTouched && expiryValidation?.hint ? 'card-expiry-hint' : undefined"
                class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-center tracking-wider"
                :class="[
                  expiryTouched && expiryError ? 'border-red-300 ring-4 ring-red-50' :
                  expiryValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' :
                  'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15'
                ]"
              />
              <p
                v-if="expiryTouched && expiryValidation?.hint"
                id="card-expiry-hint"
                class="text-xs mt-1 flex items-center gap-1.5"
                :class="expiryError ? 'text-red-500' : expiryValidation.status === 'expires-this-month' ? 'text-amber-600' : 'text-emerald-600'"
                role="status"
                aria-live="polite"
              >
                <svg
                  v-if="expiryError || expiryValidation.status === 'expires-this-month'"
                  class="w-3 h-3 shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
                </svg>
                {{ expiryValidation.hint }}
              </p>
            </div>
            <div>
              <label for="card-cvv" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                CVV
                <span v-if="expectedCvvLength === 4" class="text-[10px] font-normal text-slate-500 ml-1">(4 dígitos)</span>
              </label>
              <input
                id="card-cvv"
                :value="cvv"
                @input="onCvvInput"
                @blur="onCvvBlur"
                @focus="scrollIntoViewOnFocus"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                :placeholder="expectedCvvLength === 4 ? '1234' : '123'"
                :maxlength="expectedCvvLength"
                autocomplete="cc-csc"
                :aria-invalid="cvvTouched && cvvError"
                :aria-describedby="cvvTouched && cvvValidation?.hint ? 'card-cvv-hint' : undefined"
                class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-center tracking-wider"
                :class="[
                  cvvTouched && cvvError ? 'border-red-300 ring-4 ring-red-50' :
                  cvvValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' :
                  'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15'
                ]"
              />
              <p
                v-if="cvvTouched && cvvValidation?.hint"
                id="card-cvv-hint"
                class="text-xs mt-1 flex items-center gap-1.5"
                :class="cvvError ? 'text-red-500' : 'text-amber-600'"
                role="status"
                aria-live="polite"
              >
                <svg
                  v-if="!cvvError"
                  class="w-3 h-3 shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
                </svg>
                {{ cvvValidation.hint }}
              </p>
            </div>
          </div>
        </div>

        <AppAlert
          v-if="paymentError"
          variant="error"
          dismissible
          @dismiss="paymentError = null"
          class="animate-fade-in"
        >
          <template v-if="paymentError === 'A'">
            <span class="font-semibold">No pudimos procesar tu tarjeta.</span>
            Revisa el número, la fecha de vencimiento y el código de seguridad e inténtalo de nuevo.
            Si el error persiste, prueba con otra tarjeta.
          </template>
          <template v-else-if="paymentError === 'B'">
            <span class="font-semibold">Parece que los datos de la tarjeta no coinciden.</span>
            Verifica que el número, el nombre del titular y la fecha sean correctos.
            Tu información está segura — ningún cargo se realizó.
            <button
              type="button"
              @click="handleRetryPayment"
              class="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reintentar pago
            </button>
          </template>
          <template v-else-if="paymentError === 'TIMEOUT'">
            <span class="font-semibold">La conexión tardó demasiado.</span>
            No se realizó ningún cargo. Vuelve a intentarlo para completar tu compra.
            <button
              type="button"
              @click="handleRetryPayment"
              class="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reintentar pago
            </button>
          </template>
          <template v-else-if="paymentError === 'NETWORK'">
            <span class="font-semibold">No pudimos conectar con tu banco.</span>
            Verifica tu conexión a internet e inténtalo de nuevo. No se realizó ningún cargo.
            <button
              type="button"
              @click="handleRetryPayment"
              class="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reintentar pago
            </button>
          </template>
          <template v-else-if="paymentError === 'SYSTEM' || paymentError === 'CONFIG'">
            <span class="font-semibold">Hubo un problema con el sistema.</span>
            Por favor intenta de nuevo en unos momentos.
            <button
              type="button"
              @click="handleRetryPayment"
              class="mt-2.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-red-200 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reintentar pago
            </button>
          </template>
          <template v-else>
            <span class="font-semibold">Tu banco rechazó la transacción.</span>
            No te preocupes — no se hizo ningún cobro. Puedes intentar con otra tarjeta o
            comunicarte con tu banco para más detalles.
          </template>
        </AppAlert>

        <!-- Botón Pagar: sticky-bottom en mobile, inline con shadow-sm en desktop -->
        <div class="sticky md:static bottom-3 left-0 right-0 z-30 md:z-auto mx-auto max-w-md backdrop-blur-md md:backdrop-blur-none">
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isProcessing"
          class="bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all duration-200 ease-out shadow-xl md:shadow-sm hover:-translate-y-px hover:brightness-95 hover:shadow-2xl md:hover:shadow-md active:translate-y-0 active:scale-[0.98] w-full disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:shadow-none"
        >
          <template v-if="isProcessing">
            <AppSpinner size="lg" />
            <span>{{ processingStep }}</span>
          </template>
          <template v-else>
            <span>
              <span class="hidden md:inline">Activa tu cobertura · {{ fmt(finalPrice) }}</span>
              <span class="md:hidden">Pagar {{ fmt(finalPrice) }}</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-current transform rotate-45">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </template>
        </button>
        </div>

        <div class="flex items-center justify-center gap-2 text-xs pt-2" style="color: #00184C; opacity: 0.5;">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Tu pago está protegido de principio a fin</span>
        </div>
      </section>

      <aside class="hidden lg:block lg:col-span-5 space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">

          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Tu reserva</p>
            <button type="button" @click="$emit('go-to-step', STEPS.ROUTE)" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00184C] transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar todo
            </button>
          </div>

          <dl class="divide-y divide-slate-100">
            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu ruta</dt>
                <dd class="font-semibold text-slate-800 text-sm truncate">
                  {{ data?.origin?.name || data?.origin || '—' }}
                  <span class="text-slate-300 mx-1">→</span>
                  {{ formatDestination(data?.destination) }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Fechas del viaje</dt>
                <dd class="font-semibold text-slate-800 text-sm truncate">
                  {{ data?.dates?.start ? formatDate(data?.dates?.start) : '—' }}
                  <span class="text-slate-300 mx-1">→</span>
                  {{ data?.dates?.end ? formatDate(data?.dates?.end) : '—' }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Viajeros</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ travelersLabel }}</dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu plan</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ getPlanName() }}</dd>
                <dd class="text-xs text-slate-400">Cobertura hasta {{ getPlanCoverage() }} USD</dd>
              </div>
            </div>
          </dl>

          <DiscountCodeField
            :modelValue="appliedDiscount"
            @apply="handleApplyDiscount"
            @remove="handleRemoveDiscount"
          />

          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C; opacity: 0.7;">Plan base</span>
              <span class="text-sm font-semibold" style="color: #00184C;">{{ fmt(getPlanPrice()) }}</span>
            </div>
            <div v-if="upgradesTotal > 0" class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C; opacity: 0.7;">Coberturas adicionales</span>
              <span class="text-sm font-semibold" style="color: #00184C;">+{{ fmt(upgradesTotal) }}</span>
            </div>
            <div v-if="appliedDiscount" class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C;">Descuento ({{ appliedDiscount.discountPercent }}%)</span>
              <span class="text-sm font-semibold" style="color: #00184C;">-{{ fmt(discountAmount) }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-200">
              <span class="text-base font-bold" style="color: #00184C;">Total a pagar</span>
              <span class="text-xl font-bold" style="color: #00184C;">{{ fmt(finalPrice) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0); }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.28s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>