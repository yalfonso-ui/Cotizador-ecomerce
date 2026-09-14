<script setup>
/**
 * StepProgressBar — barra de progreso global del wizard.
 *
 * Pasos visibles: ROUTE \u2192 DATES \u2192 TRAVELERS \u2192 PLANS \u2192 DATA \u2192 UPGRADES \u2192 CHECKOUT
 * (SUCCESS se oculta).
 *
 * Avance objetivo: 0% \u2192 100% repartido de forma uniforme. Para evitar el
 * salto s\u00fabito entre Upgrades y Checkout, el pago agrega un +5%
 * intermedio al usuario tipear datos correctos en el formulario y un +10%
 * al completar el checkout (manejado por el `progressBoost` reactivo).
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useCheckoutStore } from '@/stores/useCheckoutStore.js'
import { STEPS, TOTAL_STEPS } from '@/composables/useWizardSteps.js'

const wizardStore = useWizardStore()
const checkoutStore = useCheckoutStore()
const route = useRoute()
const { currentStep, showLanding } = storeToRefs(wizardStore)

// En la pantalla de éxito forzamos el 100% independientemente del store
// (porque al recargar /confirmacion-pago, currentStep puede estar
// persistido como CHECKOUT y queremos que la barra se vea completa).
const isOnSuccessRoute = computed(() => route.path === '/confirmacion-pago')

// 7 pasos visibles: 0\u20136 (Ruta\u2026Pago).
// Step 7 (SUCCESS) queda fuera.
const VISIBLE_TOTAL = 7

// Boost adicional cuando el usuario est\u00e1 tipeando datos v\u00e1lidos del checkout.
// Da sensaci\u00f3n de "estoy cerrando la compra" entre Upgrades (83%) y Pago (83%).
const FORM_FILL_THRESHOLD = 0.5 // \u226550% del form de pago completado
const CHECKOUT_READY_BOOST = 8   // +% cuando el form del checkout est\u00e1 listo
const PAY_SUBMITTED_BOOST = 9    // +% cuando se hizo click en "Pagar" (processing)

const paymentBoost = ref(0)

function recomputeBoost() {
  // En éxito, sin boost, la barra ya está al 100% por baseProgress.
  if (currentStep.value !== STEPS.CHECKOUT) {
    paymentBoost.value = 0
    return
  }
  const filled = checkoutStore.isFormValid ? 1 :
    (Number(checkoutStore.cardNumberValid) +
      Number(checkoutStore.cardNameValid) +
      Number(checkoutStore.expiryValid) +
      Number(checkoutStore.cvvValid)) / 4

  let boost = 0
  if (filled >= FORM_FILL_THRESHOLD) boost += CHECKOUT_READY_BOOST
  if (checkoutStore.isProcessing) boost += PAY_SUBMITTED_BOOST
  paymentBoost.value = boost
}

let unwatchBoost = null

onMounted(() => {
  unwatchBoost = checkoutStore.$subscribe(() => recomputeBoost())
  recomputeBoost()
})

onBeforeUnmount(() => {
  if (unwatchBoost) unwatchBoost()
})

// % uniforme por paso (suma de los 7 pesos = 100).
// Paso ROUTE = 0%, paso CHECKOUT (entrada) = ~86%, completar pago = 100%.
const baseProgress = computed(() => {
  if (isOnSuccessRoute.value) return 100
  const s = currentStep.value
  if (s < 0) return 0
  if (s >= STEPS.SUCCESS) return 100
  if (s >= VISIBLE_TOTAL) return 100
  return (s / VISIBLE_TOTAL) * 100
})

const progressPercent = computed(() => {
  const base = baseProgress.value
  return Math.min(100, Math.round(base + paymentBoost.value))
})

// N\u00famero del paso visible para aria-label (1-indexado).
const stepNumber = computed(() => {
  const s = currentStep.value
  if (s < 0) return 1
  if (s >= VISIBLE_TOTAL) return VISIBLE_TOTAL
  return s + 1
})

// Visible: oculta en la landing inicial. Se muestra en TODO el resto
// del flujo (incluyendo la pantalla de éxito al 100%).
const isVisible = computed(() => {
  return !showLanding.value
})
</script>

<template>
  <Transition name="progress-fade">
    <div
      v-if="isVisible"
      class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/60 overflow-hidden"
      role="progressbar"
      :aria-valuenow="progressPercent"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-label="`Progreso ${progressPercent}%`"
    >
      <div
        class="h-full transition-all duration-500 ease-out"
        :style="{
          width: progressPercent + '%',
          background: 'linear-gradient(90deg, #00184C 0%, #43D3FF 100%)'
        }"
      ></div>
    </div>
  </Transition>
</template>

<style scoped>
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.25s ease;
}
.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
}
</style>
