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
      class="sticky top-16 z-30 bg-white/80 backdrop-blur-sm"
      role="region"
      aria-label="Progreso de la compra"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-1.5 pb-2.5">
        <div class="flex items-center gap-3">
          <span
            class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest tabular-nums shrink-0"
            aria-live="polite"
          >
            {{ stepNumber }} / {{ VISIBLE_TOTAL }}
          </span>
          <div
            class="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            :aria-valuenow="stepNumber"
            :aria-valuemin="1"
            :aria-valuemax="VISIBLE_TOTAL"
            :aria-label="`Paso ${stepNumber} de ${VISIBLE_TOTAL}`"
          >
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              :style="{
                width: progressPercent + '%',
                background: 'linear-gradient(90deg, #00184C 0%, #43D3FF 100%)'
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.progress-fade-enter-active,
.progress-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.progress-fade-enter-from,
.progress-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
