<script setup>
import { ref, computed, onMounted } from 'vue'
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
    description: 'Turismo y negocios',
    daysBadge: '3-120 días',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    id: 'long_stays',
    name: 'Largas Estadías',
    description: 'Nómadas y expatriados',
    daysBadge: '60-365 días',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'students',
    name: 'Estudiantes',
    description: 'Estudios e intercambios',
    daysBadge: '15-365 días',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  {
    id: 'annual_multitrip',
    name: 'Anuales Multiviajes',
    description: 'Viajes frecuentes',
    daysBadge: '30, 60 o 90 días',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
]

const selectedCategory = ref(formData.value.travelCategory || null)
const justSelectedId = ref(null)  // Para animación de feedback al seleccionar

onMounted(() => {
  if (formData.value.travelCategory) {
    selectedCategory.value = formData.value.travelCategory
  }
})

const canContinue = computed(() => !!selectedCategory.value)

function selectCategory(id) {
  // Si el usuario toca la misma categoría, no hace nada (ya está seleccionada)
  if (selectedCategory.value === id) return

  haptic.tap()
  selectedCategory.value = id
  justSelectedId.value = id
}

function handleContinue() {
  if (!canContinue.value) return
  emit('next', { travelCategory: selectedCategory.value })
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-32 sm:pb-28">
    <!-- Header -->
    <div class="text-center mb-8">
      <span class="ds-eyebrow">Cuéntanos</span>
      <h1 class="ds-heading-1">¿Qué tipo de <span style="color: #43D3FF;">viaje</span> vas a hacer?</h1>
      <p class="text-xs text-slate-500 mt-2">Elegí una opción y tocá Continuar</p>
    </div>

    <!-- Grid de 4 tarjetas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="selectCategory(cat.id)"
        :aria-pressed="selectedCategory === cat.id"
        :class="[
          'relative p-5 sm:p-6 rounded-3xl transition-all duration-300 cursor-pointer border-2 text-left active:scale-[0.98] min-h-[180px] sm:min-h-[200px] flex flex-col',
          selectedCategory === cat.id
            ? 'bg-[#F2FBFF] border-[#43D3FF] shadow-[0_8px_24px_-8px_rgba(67,211,255,0.4)] ring-2 ring-[#43D3FF]/30'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm',
          justSelectedId === cat.id ? 'ds-category-pulse' : ''
        ]"
      >
        <!-- Círculo de selección con check (esquina superior derecha) -->
        <div
          class="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          :class="selectedCategory === cat.id
            ? 'bg-[#43D3FF] text-white shadow-sm ds-check-pop'
            : 'bg-slate-100 border-2 border-slate-200'"
        >
          <svg
            v-if="selectedCategory === cat.id"
            class="w-4 h-4"
            fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <!-- Icono principal superior izquierdo -->
        <div
          class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shrink-0 transition-colors"
          :class="selectedCategory === cat.id
            ? 'bg-[#E0F4FF] text-[#00184C]'
            : 'bg-slate-100 text-slate-500'"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="cat.icon" />
          </svg>
        </div>

        <!-- Título principal -->
        <h3
          class="text-base sm:text-lg font-bold leading-tight"
          :class="selectedCategory === cat.id ? 'text-[#00184C]' : 'text-slate-900'"
        >
          {{ cat.name }}
        </h3>

        <!-- Duración protagonista (debajo del título) -->
        <div class="mt-1 flex items-baseline gap-1.5">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 shrink-0 translate-y-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" :style="{ color: selectedCategory === cat.id ? '#00184C' : '#00184C' }">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span
            class="text-xl sm:text-2xl font-extrabold tracking-tight tabular-nums leading-none"
            style="color: #00184C;"
          >{{ cat.daysBadge }}</span>
        </div>

        <!-- Descripción secundaria (texto más pequeño y tenue) -->
        <p class="mt-2 text-xs text-slate-400 leading-snug">{{ cat.description }}</p>
      </button>
    </div>

    <!-- Botón Continuar: sticky bottom, fijo y siempre visible -->
    <div
      class="fixed sm:static bottom-0 left-0 right-0 z-30 bg-white/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-slate-100 sm:border-t-0 px-4 sm:px-0 py-3 sm:py-0 sm:mt-8"
      style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));"
    >
      <div class="max-w-6xl mx-auto sm:flex sm:justify-center">
        <button
          type="button"
          @click="handleContinue"
          :disabled="!canContinue"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-base transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00184C] focus-visible:ring-offset-2"
          :class="canContinue
            ? 'bg-[#F9D35A] text-[#00184C] hover:brightness-95 active:scale-[0.98]'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
          :aria-label="canContinue ? `Continuar con ${categories.find(c => c.id === selectedCategory)?.name || 'la categoría seleccionada'}` : 'Selecciona una categoría para continuar'"
        >
          <span>Continuar</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
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
