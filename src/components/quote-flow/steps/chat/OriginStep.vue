<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const searchQuery = ref('')
const selectedOrigin = defineModel('value', { default: null })

const countries = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
]

const filteredCountries = computed(() => {
  if (!searchQuery.value.trim()) {
    return countries
  }
  const query = searchQuery.value.toLowerCase()
  return countries.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.code.toLowerCase().includes(query)
  )
})

function handleSelect(country) {
  selectedOrigin.value = country.code
  emit('update', 'origin', country.code)
}

function handleNext() {
  if (selectedOrigin.value) {
    emit('next')
  }
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">🌍</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Desde dónde viajas?
      </h2>
      <p class="text-gray-500">Selecciona tu país de origen</p>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar país..."
        class="w-full h-14 pl-12 pr-12 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all"
        @focus="clearSearch"
      />
      <button 
        v-if="searchQuery" 
        @click="clearSearch"
        class="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Country Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
      <button
        v-for="country in filteredCountries"
        :key="country.code"
        @click="handleSelect(country)"
        class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
        :class="selectedOrigin === country.code
          ? 'border-[#00184C] bg-[#00184C] text-white shadow-lg'
          : 'border-gray-200 bg-white text-gray-700 hover:border-[#43D3FF] hover:bg-gray-50'"
      >
        <span class="text-2xl">{{ country.flag }}</span>
        <span class="font-medium text-sm">{{ country.name }}</span>
      </button>
    </div>

    <!-- No results message -->
    <p v-if="filteredCountries.length === 0" class="text-center text-gray-500 py-4">
      No se encontraron países que coincidan con "{{ searchQuery }}"
    </p>

    <div class="pt-4">
      <StepButton
        text="Siguiente"
        :disabled="!selectedOrigin"
        @click="handleNext"
      />
    </div>
  </div>
</template>

<style scoped>
.grid::-webkit-scrollbar {
  width: 6px;
}
.grid::-webkit-scrollbar-track {
  background: transparent;
}
.grid::-webkit-scrollbar-thumb {
  background: #c4c9d0;
  border-radius: 3px;
}
.grid::-webkit-scrollbar-thumb:hover {
  background: #9ba1ab;
}
</style>