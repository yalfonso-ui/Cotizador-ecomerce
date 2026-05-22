<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['select-origin', 'update', 'next'])

const searchQuery = ref('')

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
  { code: 'DO', name: 'Rep. Dominicana', flag: '🇩🇴' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'OTHER', name: 'Otro', flag: '🌍' }
]

const filteredCountries = computed(() => {
  if (!searchQuery.value.trim()) return countries
  const q = searchQuery.value.toLowerCase()
  return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
})

function selectCountry(country) {
  emit('select-origin', country)
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
        placeholder="Buscar país..."
        class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
      />
    </div>

    <!-- Country Grid -->
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="country in filteredCountries"
        :key="country.code"
        @click="selectCountry(country)"
        class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 bg-white hover:border-primary-500 hover:bg-primary-500 group transition-all duration-200 text-left"
      >
        <span class="text-2xl">{{ country.flag }}</span>
        <span class="font-medium text-gray-700 group-hover:text-white">{{ country.name }}</span>
      </button>
    </div>

    <p v-if="filteredCountries.length === 0" class="text-center text-gray-500 py-8">
      No encontramos "{{ searchQuery }}"
    </p>
  </div>
</template>