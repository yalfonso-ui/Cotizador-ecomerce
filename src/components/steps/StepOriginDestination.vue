<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])

const searchOrigin = ref('')
const searchDest = ref('')
const selectedOrigin = ref(null)
const selectedDestinations = ref([])

const originCountries = [
  { code: 'CO', name: 'Colombia', flag: 'co' },
  { code: 'MX', name: 'México', flag: 'mx' },
  { code: 'AR', name: 'Argentina', flag: 'ar' },
  { code: 'CL', name: 'Chile', flag: 'cl' },
  { code: 'PE', name: 'Perú', flag: 'pe' },
  { code: 'EC', name: 'Ecuador', flag: 'ec' },
]

const destinations = [
  { code: 'US', name: 'Estados Unidos', flag: 'us', popular: true },
  { code: 'ES', name: 'España', flag: 'es', popular: true },
  { code: 'FR', name: 'Francia', flag: 'fr', popular: true },
  { code: 'IT', name: 'Italia', flag: 'it', popular: true },
  { code: 'GB', name: 'Reino Unido', flag: 'gb', popular: true },
  { code: 'DE', name: 'Alemania', flag: 'de', popular: true },
  { code: 'PT', name: 'Portugal', flag: 'pt', popular: false },
  { code: 'NL', name: 'Países Bajos', flag: 'nl', popular: false },
  { code: 'MX', name: 'México', flag: 'mx', popular: true },
  { code: 'BR', name: 'Brasil', flag: 'br', popular: true },
  { code: 'CA', name: 'Canadá', flag: 'ca', popular: true },
  { code: 'JP', name: 'Japón', flag: 'jp', popular: true },
  { code: 'AR', name: 'Argentina', flag: 'ar', popular: false },
  { code: 'CL', name: 'Chile', flag: 'cl', popular: false },
  { code: 'CO', name: 'Colombia', flag: 'co', popular: false },
  { code: 'PE', name: 'Perú', flag: 'pe', popular: false },
  { code: 'CH', name: 'Suiza', flag: 'ch', popular: false },
  { code: 'AU', name: 'Australia', flag: 'au', popular: false },
]

const filteredOrigins = computed(() => {
  if (!searchOrigin.value.trim()) return originCountries
  const q = searchOrigin.value.toLowerCase()
  return originCountries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
})

const popularDests = computed(() => {
  if (searchDest.value.trim()) return []
  return destinations.filter(d => d.popular)
})

const otherDests = computed(() => {
  if (searchDest.value.trim()) return []
  return destinations.filter(d => !d.popular)
})

const filteredDests = computed(() => {
  if (!searchDest.value.trim()) return []
  const q = searchDest.value.toLowerCase()
  return destinations.filter(d => d.name.toLowerCase().includes(q))
})

function isSelected(dest) {
  return selectedDestinations.value.some(d => d.code === dest.code)
}

function toggleDest(dest) {
  if (isSelected(dest)) {
    selectedDestinations.value = selectedDestinations.value.filter(d => d.code !== dest.code)
  } else {
    selectedDestinations.value = [...selectedDestinations.value, dest]
  }
}

function canContinue() {
  return selectedOrigin.value && selectedDestinations.value.length > 0
}

function handleContinue() {
  if (canContinue()) {
    emit('next', {
      origin: selectedOrigin.value,
      destination: selectedDestinations.value
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-sm font-semibold text-slate-700 mb-3">¿Desde dónde viajas?</h3>
      <div class="relative mb-3">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchOrigin"
          type="text"
          placeholder="Buscar país de origen..."
          class="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
        />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          v-for="country in filteredOrigins"
          :key="country.code"
          @click="selectedOrigin = country"
          class="relative flex items-center gap-2 p-3 rounded-xl border-2 bg-white transition-all duration-200 text-left"
          :class="selectedOrigin?.code === country.code
            ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50 shadow-md'
            : 'border-gray-100 hover:border-cyan-500 hover:bg-slate-50'"
        >
          <div v-if="selectedOrigin?.code === country.code" class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-sm">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-md" />
          <span class="font-medium text-sm text-slate-800">{{ country.name }}</span>
        </button>
      </div>
    </div>

    <div v-if="selectedOrigin" class="border-t border-slate-200 pt-6">
      <h3 class="text-sm font-semibold text-slate-700 mb-3">¿A dónde viajas?</h3>
      <div class="relative mb-3">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchDest"
          type="text"
          placeholder="Buscar destino..."
          class="w-full h-12 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
        />
      </div>

      <div v-if="!searchDest.trim()">
        <p class="text-xs font-medium text-gray-500 mb-2">Populares</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            v-for="dest in popularDests"
            :key="dest.code"
            @click="toggleDest(dest)"
            class="relative flex items-center gap-2 p-3 rounded-xl border-2 bg-white transition-all duration-200"
            :class="isSelected(dest)
              ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
              : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
          >
            <div v-if="isSelected(dest)" class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-md" />
            <span class="font-medium text-sm" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
          </button>
        </div>
        <p v-if="otherDests.length > 0" class="text-xs font-medium text-gray-500 mt-4 mb-2">Todos los destinos</p>
        <div v-if="otherDests.length > 0" class="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
          <button
            v-for="dest in otherDests"
            :key="dest.code"
            @click="toggleDest(dest)"
            class="relative flex items-center gap-2 p-2.5 rounded-xl border-2 bg-white transition-all duration-200"
            :class="isSelected(dest)
              ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
              : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
          >
            <div v-if="isSelected(dest)" class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-6 h-6 rounded-full object-cover ring-2 ring-white shadow-md" />
            <span class="font-medium text-xs" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
          </button>
        </div>
      </div>

      <div v-else class="space-y-2">
        <p class="text-xs font-medium text-gray-500">{{ filteredDests.length }} resultados</p>
        <div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          <button
            v-for="dest in filteredDests"
            :key="dest.code"
            @click="toggleDest(dest)"
            class="relative flex items-center gap-2 p-3 rounded-xl border-2 bg-white transition-all duration-200"
            :class="isSelected(dest)
              ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
              : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
          >
            <div v-if="isSelected(dest)" class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-md" />
            <span class="font-medium text-sm" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
          </button>
        </div>
        <p v-if="filteredDests.length === 0" class="text-center text-gray-500 py-4 text-sm">No encontramos "{{ searchDest }}"</p>
      </div>
    </div>

    <button
      @click="handleContinue"
      :disabled="!canContinue()"
      class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
    >
      <template v-if="canContinue()">
        <span>Continuar ({{ selectedDestinations.length }} destino{{ selectedDestinations.length > 1 ? 's' : '' }})</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
      <template v-else>
        <span>{{ !selectedOrigin ? 'Selecciona tu origen' : 'Selecciona al menos un destino' }}</span>
      </template>
    </button>
  </div>
</template>
