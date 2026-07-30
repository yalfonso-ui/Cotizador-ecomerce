<script setup>
import { computed } from 'vue'

/**
 * ReembolsosProgressBar
 * ─────────────────────────────────────────────────────────────
 * Indicador de progreso horizontal de 5 pasos para el wizard
 * de "Crear reembolso". Diseño consistente con el resto de la
 * plataforma: tipografía editorial, números en círculo, sin
 * colores saturados, animaciones suaves.
 *
 * Props:
 *   - steps: Array<{ title: string, subtitle: string }> (5 items)
 *   - currentStep: number (1-indexed, 1..5)
 *   - totalSteps: number (default 5)
 *
 * Comportamiento visual:
 *   - Pasos completados (currentStep > i): círculo navy + check
 *   - Paso actual: círculo navy con borde
 *   - Pasos futuros: círculo blanco con borde slate
 *   - Línea entre pasos: navy si ambos están completados/actual,
 *     slate en otro caso.
 */

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    validator: (val) => val.length >= 2
  },
  currentStep: {
    type: Number,
    required: true,
    validator: (val) => val >= 1
  }
})

const totalSteps = computed(() => props.steps.length)

function stepState(index) {
  // index es 0-based, currentStep es 1-based
  const i = index + 1
  if (i < props.currentStep) return 'completed'
  if (i === props.currentStep) return 'active'
  return 'pending'
}

function lineState(index) {
  // Línea que va DESPUÉS del step en posición `index`
  // (la línea entre step `index` y step `index+1`)
  const i = index + 1
  if (i < props.currentStep) return 'completed'
  return 'pending'
}
</script>

<template>
  <nav
    :aria-label="`Paso ${currentStep} de ${totalSteps}`"
    class="w-full"
  >
    <ol class="flex items-start justify-between gap-1 sm:gap-2">
      <li
        v-for="(step, index) in steps"
        :key="step.title"
        class="flex-1 flex flex-col items-center min-w-0"
        :aria-current="stepState(index) === 'active' ? 'step' : undefined"
      >
        <div class="flex items-center w-full">
          <!-- Línea a la izquierda del círculo (excepto en el primero) -->
          <div
            v-if="index > 0"
            class="flex-1 h-px transition-colors duration-500"
            :class="lineState(index - 1) === 'completed'
              ? 'bg-[#00184C]'
              : 'bg-slate-200'"
            aria-hidden="true"
          ></div>

          <!-- Círculo del paso -->
          <div
            class="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300"
            :class="{
              'bg-[#00184C] text-white shadow-sm': stepState(index) === 'active',
              'bg-[#00184C] text-white': stepState(index) === 'completed',
              'bg-white text-slate-400 border border-slate-200': stepState(index) === 'pending'
            }"
            aria-hidden="true"
          >
            <!-- Check si está completado -->
            <svg
              v-if="stepState(index) === 'completed'"
              class="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Número del paso -->
            <span v-else>{{ index + 1 }}</span>
          </div>

          <!-- Línea a la derecha del círculo (excepto en el último) -->
          <div
            v-if="index < steps.length - 1"
            class="flex-1 h-px transition-colors duration-500"
            :class="lineState(index) === 'completed'
              ? 'bg-[#00184C]'
              : 'bg-slate-200'"
            aria-hidden="true"
          ></div>
        </div>

        <!-- Etiqueta del paso -->
        <div class="mt-2.5 text-center min-w-0 w-full px-1">
          <p
            class="text-[11px] sm:text-xs font-bold tracking-tight truncate transition-colors duration-200"
            :class="stepState(index) === 'pending' ? 'text-slate-400' : 'text-[#00184C]'"
          >
            {{ step.title }}
          </p>
          <p
            class="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate"
          >
            {{ step.subtitle }}
          </p>
        </div>
      </li>
    </ol>
  </nav>
</template>
