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
  <div class="ds-focus-column" data-origin-root>
    <div v-if="isDetecting" class="w-full space-y-3" role="status" aria-live="polite">
      <div class="w-full h-[72px] bg-slate-50 rounded-xl animate-pulse"></div>
      <p class="text-xs text-slate-400">Solo un instante, te llevamos al siguiente paso</p>
    </div>

    <template v-else>
      <span class="ds-eyebrow">
        Ya casi empezamos
      </span>

      <h1 class="ds-heading-1">
        Cuéntanos, <span style="color: #43D3FF;">¿desde dónde viajas?</span>
      </h1>

      <p class="ds-helper max-w-sm">
        Esto nos permite ajustar tu cobertura al país correcto.
      </p>

      <div v-if="!isDropdownOpen" class="w-full space-y-3">
        <button
          type="button"
          data-testid="origin-trigger"
          @click="toggleDropdown"
          class="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
        >
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
              <img
                :src="`https://flagcdn.com/w80/${selectedCountry.flag}.png`"
                :alt="selectedCountry.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="text-left min-w-0">
              <span class="text-[10px] uppercase tracking-wider font-bold block" style="color: #00184C;">
                Tu punto de partida
              </span>
              <span class="text-lg font-semibold text-slate-800 truncate block">{{ selectedCountry.name }}</span>
            </div>
          </div>
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <p class="text-xs text-slate-400">
          ¿Necesitas ajustarla?
          <button type="button" @click="toggleDropdown" class="font-medium hover:opacity-80 focus:outline-none focus-visible:underline" style="color: #43D3FF;">Cámbiala aquí</button>.
        </p>
      </div>

      <div v-else class="w-full space-y-2 text-left">
        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="origin-search"
            v-model="search"
            type="text"
            placeholder="Escribe tu país..."
            class="w-full h-14 pl-12 pr-12 text-lg bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            autocomplete="off"
          />
          <button type="button"
            @click="closeDropdown"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Cerrar buscador"
          >
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
          <button type="button"
            v-for="country in filtered"
            :key="country.code"
            @click="selectCountry(country)"
            class="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
            :class="selectedCountry?.code === country.code ? 'bg-blue-50/50' : ''"
          >
            <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-7 h-7 rounded-full object-cover" />
            <span class="font-medium text-slate-800 flex-1">{{ country.name }}</span>
            <svg v-if="selectedCountry?.code === country.code" class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <p v-if="filtered.length === 0" class="text-center text-slate-500 py-6 text-sm">
            Aún no llegamos a "{{ search }}". Prueba con otro nombre.
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="handleContinue"
        :disabled="!selectedCountry || isDetecting"
        class="w-full mt-6 bg-[#FFCC00] hover:bg-[#E6B800] text-slate-900 font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        <span>{{ selectedCountry && !isDetecting ? 'Sigue con tu destino' : 'Confirma tu país de origen' }}</span>
        <svg v-if="selectedCountry && !isDetecting" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </template>
  </div>
</template>