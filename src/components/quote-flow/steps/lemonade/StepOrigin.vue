<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selected: Object
})

const emit = defineEmits(['select-origin', 'update', 'next'])

const searchQuery = ref('')

const countries = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' }
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
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar país..."
        class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="country in filteredCountries"
        :key="country.code"
        @click="selectCountry(country)"
        class="p-6 rounded-2xl border border-slate-200 bg-white transition-all duration-200 text-center flex flex-col items-center gap-2"
        :class="selected?.code === country.code
          ? 'ring-2 ring-cyan-500 bg-cyan-50 border-transparent'
          : 'hover:border-cyan-400 hover:bg-slate-50'"
      >
        <span class="text-3xl font-bold text-slate-800">{{ country.flag }}</span>
        <span class="text-sm text-slate-500">{{ country.name }}</span>
      </button>
    </div>

    <p v-if="filteredCountries.length === 0" class="text-center text-slate-400 py-8">
      No encontramos "{{ searchQuery }}"
    </p>
  </div>
</template>