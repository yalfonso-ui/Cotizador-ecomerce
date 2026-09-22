<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'

const emit = defineEmits(['next', 'go-to-step'])

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)

const categories = [
  {
    id: 'short_trips',
    name: 'Viajes cortos',
    desc: 'Ideal para turismo y negocios.',
    coverage: 'COBERTURA DE 3 A 120 DÍAS.',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    id: 'long_stays',
    name: 'Largas Estadías',
    desc: 'Ideal para nómadas digitales y expatriados.',
    coverage: 'COBERTURA DE 60 A 365 DÍAS.',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    id: 'students',
    name: 'Estudiantes',
    desc: 'Ideal para estudios e intercambios académicos.',
    coverage: 'COBERTURA DE 15 A 365 DÍAS.',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
  },
  {
    id: 'annual_multitrip',
    name: 'Anuales Multiviajes',
    desc: 'Perfecto para viajeros frecuentes.',
    coverage: 'POR VIAJES DE 30, 60 Y 90 DÍAS.',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
]

const selectedCategory = ref(formData.value.travelCategory || null)

onMounted(() => {
  if (formData.value.travelCategory) {
    selectedCategory.value = formData.value.travelCategory
  }
})

const canContinue = computed(() => !!selectedCategory.value)

const selectedCategoryData = computed(() => {
  return categories.find(c => c.id === selectedCategory.value)
})

function selectCategory(id) {
  selectedCategory.value = id
}

function handleContinue() {
  if (!canContinue.value) return
  emit('next', { travelCategory: selectedCategory.value })
}
</script>

<template>
  <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 md:pt-10 pb-28">
    <!-- Header -->
    <div class="text-center mb-8">
      <span class="ds-eyebrow">Cuéntanos</span>
      <h1 class="ds-heading-1">¿Qué tipo de <span style="color: #43D3FF;">viaje</span> vas a hacer?</h1>
    </div>

    <!-- Grid de 4 tarjetas horizontales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        @click="selectCategory(cat.id)"
        :class="[
          'relative p-6 rounded-3xl transition-all duration-300 cursor-pointer border-2 shadow-lg text-left',
          selectedCategory === cat.id
            ? 'bg-[#F2FBFF] border-[#43D3FF] shadow-sky-100'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        ]"
      >
        <!-- Círculo de selección con check (esquina superior derecha) -->
        <div
          v-if="selectedCategory === cat.id"
          class="absolute top-4 right-4 w-7 h-7 bg-[#43D3FF] rounded-full flex items-center justify-center text-white shadow-sm"
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
        <p class="text-sm text-slate-500 mb-6">{{ cat.desc }}</p>

        <!-- Pastilla inferior de cobertura -->
        <div
          class="rounded-2xl p-3.5 flex items-center gap-3 shadow-sm"
          :class="selectedCategory === cat.id
            ? 'bg-white border border-slate-100'
            : 'bg-slate-50 border border-slate-100'"
        >
          <div
            :class="selectedCategory === cat.id ? 'text-[#43D3FF]' : 'text-slate-400'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span class="text-xs font-bold text-[#0A2540] tracking-wider">{{ cat.coverage }}</span>
        </div>
      </button>
    </div>

    <!-- Botón Continuar -->
    <div class="flex justify-center">
      <button
        type="button"
        @click="handleContinue"
        :disabled="!canContinue"
        class="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold rounded-full transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        :class="canContinue
          ? 'bg-[#F9D35A] text-[#00184C] hover:brightness-95 shadow-sm focus-visible:ring-[#43D3FF]'
          : 'bg-slate-100 text-slate-400 cursor-not-allowed'"
      >
        <span v-if="!selectedCategory">Selecciona una categoría</span>
        <span v-else>Continuar</span>
        <svg
          v-if="selectedCategory"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </button>
    </div>
  </div>
</template>
