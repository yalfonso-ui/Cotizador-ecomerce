<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'next'])

const search = ref('')
const isDropdownOpen = ref(false)
const isDetecting = ref(true)
const hasPreloaded = ref(!!props.modelValue)
const selectedCountry = ref(props.modelValue || null)

const countries = [
  { code: 'CO', name: 'Colombia', flag: 'co' },
  { code: 'MX', name: 'México', flag: 'mx' },
  { code: 'AR', name: 'Argentina', flag: 'ar' },
  { code: 'CL', name: 'Chile', flag: 'cl' },
  { code: 'PE', name: 'Perú', flag: 'pe' },
  { code: 'EC', name: 'Ecuador', flag: 'ec' },
  { code: 'US', name: 'Estados Unidos', flag: 'us' },
  { code: 'ES', name: 'España', flag: 'es' },
  { code: 'BR', name: 'Brasil', flag: 'br' }
]

const filtered = computed(() => {
  if (!search.value.trim()) return countries
  const q = search.value.toLowerCase()
  return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
})

const detectedCountry = computed(() =>
  countries.find(c => c.code === 'CO') || countries[0]
)

watch(selectedCountry, (val) => {
  if (val) emit('update:modelValue', val)
})

onMounted(() => {
  if (hasPreloaded.value) {
    isDetecting.value = false
    return
  }
  setTimeout(() => {
    if (!selectedCountry.value) {
      selectedCountry.value = detectedCountry.value
    }
    isDetecting.value = false
  }, 1200)
})

function selectCountry(country) {
  selectedCountry.value = country
  isDropdownOpen.value = false
  search.value = ''
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    setTimeout(() => {
      document.getElementById('origin-search')?.focus()
    }, 100)
  }
}

function closeDropdown() {
  isDropdownOpen.value = false
  search.value = ''
}

function handleContinue() {
  if (selectedCountry.value) {
    emit('next', { origin: selectedCountry.value })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isDetecting" class="space-y-3" role="status" aria-live="polite">
      <div class="w-full h-14 bg-slate-100 border-2 border-slate-200 rounded-xl animate-pulse"></div>
      <p class="text-xs text-slate-500 text-center">
        Preparando opciones para ti
      </p>
    </div>

    <div v-else-if="!isDropdownOpen" class="space-y-3">
      <button
        type="button"
        @click="toggleDropdown"
        class="relative w-full flex items-center gap-3 p-4 pr-12 bg-white border-2 border-cyan-500 rounded-xl text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/30"
      >
        <img
          :src="`https://flagcdn.com/w40/${selectedCountry.flag}.png`"
          :alt="selectedCountry.name"
          class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md"
        />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">País de origen detectado</p>
          <p class="font-semibold text-slate-800 text-lg">{{ selectedCountry.name }}</p>
        </div>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center shadow-sm">
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <p class="text-xs text-slate-500 text-center">
        Detectamos tu ubicación. Si no es correcta,
        <button type="button" @click="toggleDropdown" class="text-cyan-600 font-semibold hover:underline focus:outline-none focus-visible:underline focus-visible:rounded">cámbiala aquí</button>.
      </p>
    </div>

    <div v-else class="space-y-3">
      <div class="relative">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="origin-search"
          v-model="search"
          type="text"
          placeholder="Buscar país..."
          class="w-full h-14 pl-12 pr-12 text-lg bg-white border-2 border-cyan-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
          autocomplete="off"
        />
        <button type="button"
          @click="closeDropdown"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
          aria-label="Cerrar buscador"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="bg-white border-2 border-slate-100 rounded-xl max-h-72 overflow-y-auto">
        <button type="button"
          v-for="country in filtered"
          :key="country.code"
          @click="selectCountry(country)"
          class="w-full flex items-center gap-3 p-3 hover:bg-cyan-50 transition-colors text-left border-b border-slate-50 last:border-0"
          :class="selectedCountry?.code === country.code ? 'bg-cyan-50' : ''"
        >
          <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-sm" />
          <span class="font-medium text-slate-800 flex-1">{{ country.name }}</span>
          <svg v-if="selectedCountry?.code === country.code" class="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <p v-if="filtered.length === 0" class="text-center text-slate-500 py-6 text-sm">
          No encontramos "{{ search }}"
        </p>
      </div>
    </div>

    <button
      type="button"
      @click="handleContinue"
      :disabled="!selectedCountry || isDetecting"
      class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold text-base rounded-xl flex items-center justify-center gap-2 mx-auto disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/30"
    >
      <span>{{ selectedCountry && !isDetecting ? 'Continuar' : 'Selecciona un país' }}</span>
      <svg v-if="selectedCountry && !isDetecting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </div>
</template>
