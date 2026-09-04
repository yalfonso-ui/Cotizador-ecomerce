<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { STEPS, STEP_LABELS, TOTAL_STEPS } from '@/composables/useWizardSteps.js'

const props = defineProps({
  // El step actual. Si no se pasa, se lee del store.
  step: { type: Number, default: null }
})

const router = useRouter()
const wizardStore = useWizardStore()
const { currentStep } = storeToRefs(wizardStore)

// El número "humano" del step (1-indexed para el usuario).
// Step 7 (SUCCESS) no muestra progress porque es el final.
// Steps 0..6 → "Paso 1..7 de 7" (TOTAL_STEPS - 1 = 7).
const stepNumber = computed(() => {
  const s = props.step ?? currentStep.value
  if (s === STEPS.SUCCESS) return null
  return s + 1
})

const stepLabel = computed(() => {
  const s = props.step ?? currentStep.value
  return STEP_LABELS[s] || ''
})

const canGoBack = computed(() => {
  const s = props.step ?? currentStep.value
  // Puede retroceder en cualquier step excepto ROUTE y SUCCESS.
  return s !== STEPS.ROUTE && s !== STEPS.SUCCESS
})

function handleBack() {
  const s = props.step ?? currentStep.value
  if (s === STEPS.ROUTE) return
  // Reducimos el step en 1 y navegamos. Usamos push para preservar history
  // (mejor experiencia con back del navegador).
  const targetStep = Math.max(0, s - 1)
  wizardStore.goToStep(targetStep)
  router.push({ path: '/cotizacion', query: { step: targetStep } })
}
</script>

<template>
  <div
    v-if="stepNumber !== null"
    class="flex items-center justify-between gap-2 max-w-3xl mx-auto px-4 sm:px-6 pt-4 md:pt-6"
  >
    <button
      v-if="canGoBack"
      type="button"
      @click="handleBack"
      class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00184C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-1 rounded-md px-2 py-1"
      :aria-label="`Volver al paso anterior (${stepLabel})`"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Volver</span>
    </button>
    <!-- Spacer para mantener el indicador alineado a la derecha -->
    <span v-else aria-hidden="true" class="w-16"></span>

    <p
      class="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 tabular-nums"
      role="status"
      aria-live="polite"
    >
      Paso {{ stepNumber }} de {{ TOTAL_STEPS - 1 }} · {{ stepLabel }}
    </p>
  </div>
</template>