<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update'])

const search = ref('')
const selectedCode = ref(props.modelValue?.code || '')

const countries = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
]

const filtered = computed(() => {
  if (!search.value.trim()) return countries
  const q = search.value.toLowerCase()
  return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
})

function select(country) {
  selectedCode.value = country.code
  emit('update', country)
}
</script>

<template>
  <div class="space-y-6">
    <div class="relative">
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Buscar país..."
        class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
      />
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <button
        v-for="country in filtered"
        :key="country.code"
        @click="select(country)"
        class="relative flex items-center gap-3 p-4 rounded-xl border-2 bg-white transition-all duration-200 text-left"
        :class="selectedCode === country.code
          ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
          : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
      >
        <div v-if="selectedCode === country.code" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="text-2xl">{{ country.flag }}</span>
        <span class="font-medium" :class="selectedCode === country.code ? 'text-cyan-700' : 'text-gray-700'">{{ country.name }}</span>
      </button>
    </div>

    <p v-if="filtered.length === 0" class="text-center text-gray-500 py-8">
      No encontramos "{{ search }}"
    </p>
  </div>
</template>