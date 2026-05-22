<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select-destination', 'update', 'next'])

const searchQuery = ref('')

const destinations = [
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', popular: true },
  { code: 'ES', name: 'España', flag: '🇪🇸', popular: true },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', popular: true },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', popular: true },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', popular: true },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', popular: true },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', popular: true },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', popular: true },
  { code: 'MX', name: 'México', flag: '🇲🇽', popular: true },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', popular: true },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', popular: true },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', popular: true },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', popular: false },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', popular: false },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', popular: false },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', popular: false },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', popular: false },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', popular: false },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭', popular: false },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', popular: false },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', popular: false },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷', popular: false },
  { code: 'CZ', name: 'Rep. Checa', flag: '🇨🇿', popular: false },
  { code: 'HR', name: 'Croacia', flag: '🇭🇷', popular: false },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱', popular: false },
  { code: 'HU', name: 'Hungría', flag: '🇭🇺', popular: false },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭', popular: false },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', popular: false },
  { code: 'AE', name: 'Emiratos', flag: '🇦🇪', popular: false },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', popular: false },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', popular: false },
  { code: 'ZA', name: 'Sudáfica', flag: '🇿🇦', popular: false },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦', popular: false },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷', popular: false },
  { code: 'OTHER', name: 'Otro', flag: '🌍', popular: false }
]

const popularDestinations = computed(() => {
  if (searchQuery.value.trim()) return []
  return destinations.filter(d => d.popular)
})

const otherDestinations = computed(() => {
  if (searchQuery.value.trim()) return []
  return destinations.filter(d => !d.popular)
})

const filteredDestinations = computed(() => {
  if (!searchQuery.value.trim()) return destinations
  const q = searchQuery.value.toLowerCase()
  return destinations.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q))
})

function selectDestination(dest) {
  emit('select-destination', dest)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Search -->
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar destino..."
        class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
      />
    </div>

    <!-- Popular (when not searching) -->
    <div v-if="!searchQuery.trim()" class="space-y-4">
      <p class="text-sm font-medium text-gray-500">Populares</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="dest in popularDestinations"
          :key="dest.code"
          @click="selectDestination(dest)"
          class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:bg-primary-500 group transition-all duration-200"
        >
          <span class="text-2xl">{{ dest.flag }}</span>
          <span class="font-medium text-gray-700 group-hover:text-white">{{ dest.name }}</span>
        </button>
      </div>

      <p class="text-sm font-medium text-gray-500 pt-2">Todos los destinos</p>
      <div class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        <button
          v-for="dest in otherDestinations"
          :key="dest.code"
          @click="selectDestination(dest)"
          class="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:bg-primary-500 group transition-all duration-200"
        >
          <span class="text-xl">{{ dest.flag }}</span>
          <span class="font-medium text-sm text-gray-700 group-hover:text-white">{{ dest.name }}</span>
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-else class="space-y-4">
      <p class="text-sm font-medium text-gray-500">{{ filteredDestinations.length }} resultados</p>
      <div class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        <button
          v-for="dest in filteredDestinations"
          :key="dest.code"
          @click="selectDestination(dest)"
          class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:bg-primary-500 group transition-all duration-200"
        >
          <span class="text-2xl">{{ dest.flag }}</span>
          <span class="font-medium text-gray-700 group-hover:text-white">{{ dest.name }}</span>
        </button>
      </div>
      <p v-if="filteredDestinations.length === 0" class="text-center text-gray-500 py-8">
        No encontramos "{{ searchQuery }}"
      </p>
    </div>
  </div>
</template>