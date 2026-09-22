<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { useHaptic } from '@/composables/useHaptic.js'

const emit = defineEmits(['next', 'go-to-step'])

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)
const haptic = useHaptic()

const categories = [
  {
    id: 'short_trips',
    name: 'Viajes cortos',
    subtitle: 'Turismo y negocios • 3-120 días',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    id: 'long_stays',
    name: 'Largas Estadías',
    subtitle: 'Nómadas y expatriados • 60-365 días',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'students',
    name: 'Estudiantes',
    subtitle: 'Estudios e intercambios • 15-365 días',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  {
    id: 'annual_multitrip',
    name: 'Anuales Multiviajes',
    subtitle: 'Viajes frecuentes • 30, 60 o 90 días',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
]

const selectedCategory = ref(formData.value.travelCategory || null)
const justSelectedId = ref(null)  // Para animación de feedback
const isAdvancing = ref(false)     // Evita doble-trigger durante la transición

// Duración del feedback visual antes del auto-avance (ms)
const FEEDBACK_DELAY_MS = 350
let advanceTimer = null

onMounted(() => {
  if (formData.value.travelCategory) {
    selectedCategory.value = formData.value.travelCategory
  }
})

onBeforeUnmount(() => {
  if (advanceTimer) {
    clearTimeout(advanceTimer)
    advanceTimer = null
  }
})

const canContinue = computed(() => !!selectedCategory.value)

const selectedCategoryData = computed(() => {
  return categories.find(c => c.id === selectedCategory.value)
})

function selectCategory(id) {
  // Si ya estamos avanzando, ignora taps adicionales
  if (isAdvancing.value) return

  // Si el usuario toca la misma categoría, no hace nada (ya está seleccionada)
  if (selectedCategory.value === id) return

  haptic.tap()
  selectedCategory.value = id
  justSelectedId.value = id

  // Auto-avance después del feedback visual
  isAdvancing.value = true
  if (advanceTimer) clearTimeout(advanceTimer)
  advanceTimer = setTimeout(() => {
    emit('next', { travelCategory: id })
    // No reseteamos isAdvancing porque el componente se desmontará
  }, FEEDBACK_DELAY_MS)
}

function handleContinue() {
  if (!canContinue.value) return
  // Si hay un auto-avance en curso, cancélalo (el usuario prefiere confirmación manual)
  if (advanceTimer) {
    clearTimeout(advanceTimer)
    advanceTimer = null
  }
  emit('next', { travelCategory: selectedCategory.value })
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-28">
    <!-- Header -->
    <div class="text-center mb-8">
      <span class="ds-eyebrow">Cuéntanos</span>
      <h1 class="ds-heading-1">¿Qué tipo de <span style="color: #43D3FF;">viaje</span> vas a hacer?</h1>
      <p class="text-xs text-slate-500 mt-2">Toca una opción para continuar</p>
    </div>

    <!-- Grid de 4 tarjetas horizontales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="selectCategory(cat.id)"
        :class="[
          'relative p-6 rounded-3xl transition-all duration-300 cursor-pointer border-2 shadow-lg text-left active:scale-[0.98]',
          selectedCategory === cat.id
            ? 'bg-[#F2FBFF] border-[#43D3FF] shadow-sky-100'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm',
          justSelectedId === cat.id ? 'ds-category-pulse' : ''
        ]"
      >
        <!-- Círculo de selección con check (esquina superior derecha) -->
        <div
          v-if="selectedCategory === cat.id"
          class="absolute top-4 right-4 w-7 h-7 bg-[#43D3FF] rounded-full flex items-center justify-center text-white shadow-sm ds-check-pop"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Icono principal superior izquierdo -->
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          :class="selectedCategory === cat.id
            ? 'bg-[#E0F4FF] text-[#0A2540]'
            : 'bg-slate-100 text-slate-500'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="cat.icon" />
          </svg>
        </div>

        <!-- Títulos y descripción -->
        <h3
          class="text-lg font-bold mb-1"
          :class="selectedCategory === cat.id ? 'text-[#0A2540]' : 'text-slate-900'"
        >
          {{ cat.name }}
        </h3>
        <p class="text-sm text-slate-500">{{ cat.subtitle }}</p>
      </button>
    </div>

    <!-- Indicador de progreso sutil (en lugar del botón Continuar) -->
    <div class="flex justify-center items-center gap-2 text-xs text-slate-400">
      <svg class="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <span>Avanzamos automáticamente al elegir</span>
    </div>
  </div>
</template>

<style scoped>
/* ── Feedback visual al seleccionar categoría (auto-avance) ── */

/* Pulse en la card recién seleccionada (~350ms, coincide con FEEDBACK_DELAY_MS) */
.ds-category-pulse {
  animation: ds-category-pulse 350ms cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes ds-category-pulse {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(67, 211, 255, 0.18); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(67, 211, 255, 0); }
}

/* Pop-in del círculo de check */
.ds-check-pop {
  animation: ds-check-pop 280ms cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes ds-check-pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Reduced motion: respeta la preferencia del usuario */
@media (prefers-reduced-motion: reduce) {
  .ds-category-pulse,
  .ds-check-pop {
    animation: none !important;
  }
}
</style>
