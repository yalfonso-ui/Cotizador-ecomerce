<script setup>
import { ref, computed } from 'vue'
import StepButton from '@/components/quote-flow/ui/StepButton.vue'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update', 'next'])

const search = ref('')
const selectedCode = ref(props.modelValue?.code || '')
const selectedCountry = ref(props.modelValue || null)

const countries = [
  { code: 'CO', name: 'Colombia', flag: 'co' },
  { code: 'MX', name: 'México', flag: 'mx' },
  { code: 'AR', name: 'Argentina', flag: 'ar' },
  { code: 'CL', name: 'Chile', flag: 'cl' },
  { code: 'PE', name: 'Perú', flag: 'pe' },
  { code: 'EC', name: 'Ecuador', flag: 'ec' },
]

const filtered = computed(() => {
  if (!search.value.trim()) return countries
  const q = search.value.toLowerCase()
  return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
})

function select(country) {
  selectedCode.value = country.code
  selectedCountry.value = country
  emit('update', country)
}

function handleContinue() {
  if (selectedCountry.value) {
    emit('next', { origin: selectedCountry.value })
  }
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
          ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50 shadow-md'
          : 'border-gray-100 hover:border-cyan-500 hover:bg-slate-50'"
      >
        <div v-if="selectedCode === country.code" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-sm">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md" />
        <span class="font-medium text-slate-800">{{ country.name }}</span>
      </button>
    </div>

    <p v-if="filtered.length === 0" class="text-center text-gray-500 py-8">
      No encontramos "{{ search }}"
    </p>

    <StepButton
      @click="handleContinue"
      :disabled="!selectedCountry"
      variant="accent"
    >
      <template v-if="selectedCountry">
        <span>Continuar</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
      <template v-else>
        <span>Selecciona un país</span>
      </template>
    </StepButton>
  </div>
</template>