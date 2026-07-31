<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { TOTAL_STEPS } from '@/composables/useWizardSteps.js'

const wizardStore = useWizardStore()
const { currentStep, showLanding } = storeToRefs(wizardStore)

// Pasos visibles del flujo de compra (excluye SUCCESS, que es la confirmación final)
const VISIBLE_TOTAL = 6

// Variable reactiva: número del paso actual (1-indexado para el usuario)
const stepNumber = computed(() => {
  const s = currentStep.value
  if (s < 0) return 1
  if (s >= VISIBLE_TOTAL) return VISIBLE_TOTAL
  return s + 1
})

const progressPercent = computed(() => {
  return (stepNumber.value / VISIBLE_TOTAL) * 100
})

// Ocultar en landing y en la pantalla de éxito
const isVisible = computed(() => {
  return !showLanding.value && currentStep.value < TOTAL_STEPS - 1
})
</script>

<template>
  <Transition name="progress-fade">
    <div
      v-if="isVisible"
      class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-200/60 overflow-hidden"
      role="progressbar"
      :aria-valuenow="stepNumber"
      :aria-valuemin="1"
      :aria-valuemax="VISIBLE_TOTAL"
      :aria-label="`Paso ${stepNumber} de ${VISIBLE_TOTAL}`"
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
