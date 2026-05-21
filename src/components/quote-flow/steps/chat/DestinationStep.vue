<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const searchQuery = ref('')
const selectedDestination = defineModel('value', { default: null })

const countries = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', popular: true },
  { code: 'ES', name: 'España', flag: '🇪🇸', popular: true },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', popular: true },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', popular: true },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', popular: true },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', popular: false },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', popular: false },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', popular: false },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', popular: false },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭', popular: false },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', popular: false },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷', popular: false },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿', popular: false },
  { code: 'HR', name: 'Croacia', flag: '🇭🇷', popular: false },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱', popular: false },
  { code: 'HU', name: 'Hungría', flag: '🇭🇺', popular: false },
  { code: 'MX', name: 'México', flag: '🇲🇽', popular: true },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', popular: true },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', popular: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', popular: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', popular: false },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', popular: false },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', popular: false },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', popular: false },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', popular: false },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', popular: false },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', popular: true },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', popular: true },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', popular: false },
  { code: 'CN', name: 'China', flag: '🇨🇳', popular: false },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭', popular: false },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', popular: false },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', popular: false },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾', popular: false },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', popular: false },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭', popular: false },
  { code: 'IN', name: 'India', flag: '🇮🇳', popular: false },
  { code: 'AE', name: 'Emiratos Árabes', flag: '🇦🇪', popular: false },
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦', popular: false },
  { code: 'EG', name: 'Egipto', flag: '🇪🇬', popular: false },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦', popular: false },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷', popular: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', popular: false },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', popular: false },
  { code: 'OTHER', name: 'Otro', flag: '🌍', popular: false },
]

const popularDestinations = computed(() => {
  return countries.filter(c => c.popular && (!searchQuery.value.trim() || c.name.toLowerCase().includes(searchQuery.value.toLowerCase())))
})

const otherDestinations = computed(() => {
  return countries.filter(c => !c.popular && (!searchQuery.value.trim() || c.name.toLowerCase().includes(searchQuery.value.toLowerCase())))
})

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
  selectedDestination.value = country.code
  emit('update', 'destination', country.code)
}

function handleNext() {
  if (selectedDestination.value) {
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
        <span class="text-3xl">✈️</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿A dónde viajas?
      </h2>
      <p class="text-gray-500">Selecciona tu destino principal</p>
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
        placeholder="Buscar destino..."
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

    <!-- Popular Destinations (when not searching) -->
    <div v-if="!searchQuery.trim()" class="space-y-4">
      <p class="text-sm font-medium text-gray-500 px-1">Destinos populares</p>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          v-for="country in popularDestinations"
          :key="country.code"
          @click="handleSelect(country)"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
          :class="selectedDestination === country.code
            ? 'border-[#00184C] bg-[#00184C] text-white shadow-lg'
            : 'border-gray-200 bg-white text-gray-700 hover:border-[#43D3FF] hover:bg-gray-50'"
        >
          <span class="text-3xl">{{ country.flag }}</span>
          <span class="font-medium text-sm text-center">{{ country.name }}</span>
        </button>
      </div>
    </div>

    <!-- All Countries (when searching) -->
    <div v-else class="space-y-4">
      <p class="text-sm font-medium text-gray-500 px-1">Resultados ({{ filteredCountries.length }})</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
        <button
          v-for="country in filteredCountries"
          :key="country.code"
          @click="handleSelect(country)"
          class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
          :class="selectedDestination === country.code
            ? 'border-[#00184C] bg-[#00184C] text-white shadow-lg'
            : 'border-gray-200 bg-white text-gray-700 hover:border-[#43D3FF] hover:bg-gray-50'"
        >
          <span class="text-2xl">{{ country.flag }}</span>
          <span class="font-medium text-sm">{{ country.name }}</span>
        </button>
      </div>
    </div>

    <!-- All Destinations (when not searching) -->
    <div v-if="!searchQuery.trim()" class="space-y-4">
      <p class="text-sm font-medium text-gray-500 px-1">Todos los destinos</p>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
        <button
          v-for="country in otherDestinations"
          :key="country.code"
          @click="handleSelect(country)"
          class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
          :class="selectedDestination === country.code
            ? 'border-[#00184C] bg-[#00184C] text-white shadow-lg'
            : 'border-gray-200 bg-white text-gray-700 hover:border-[#43D3FF] hover:bg-gray-50'"
        >
          <span class="text-2xl">{{ country.flag }}</span>
          <span class="font-medium text-sm">{{ country.name }}</span>
        </button>
      </div>
    </div>

    <!-- No results message -->
    <p v-if="searchQuery.trim() && filteredCountries.length === 0" class="text-center text-gray-500 py-8">
      No se encontraron destinos que coincidan con "{{ searchQuery }}"
    </p>

    <div class="pt-4">
      <StepButton
        text="Siguiente"
        :disabled="!selectedDestination"
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