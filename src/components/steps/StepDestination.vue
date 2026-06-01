<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Array
})
const emit = defineEmits(['update', 'next'])

const search = ref('')

const selectedDestinations = ref(props.modelValue || [])

const destinations = [
  { code: 'US', name: 'Estados Unidos', flag: 'us', popular: true },
  { code: 'ES', name: 'España', flag: 'es', popular: true },
  { code: 'FR', name: 'Francia', flag: 'fr',  popular: true },
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

const popular = computed(() => {
  if (search.value.trim()) return []
  return destinations.filter(d => d.popular)
})

const others = computed(() => {
  if (search.value.trim()) return []
  return destinations.filter(d => !d.popular)
})

const filtered = computed(() => {
  if (!search.value.trim()) return []
  const q = search.value.toLowerCase()
  return destinations.filter(d => d.name.toLowerCase().includes(q))
})

function isSelected(dest) {
  return selectedDestinations.value.some(d => d.code === dest.code)
}

function toggle(dest) {
  if (isSelected(dest)) {
    selectedDestinations.value = selectedDestinations.value.filter(d => d.code !== dest.code)
  } else {
    selectedDestinations.value = [...selectedDestinations.value, dest]
  }
  emit('update', selectedDestinations.value)
}

function handleContinue() {
  if (selectedDestinations.value.length > 0) {
    emit('next', { destination: selectedDestinations.value })
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
        placeholder="Buscar destino..."
        class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all"
      />
    </div>

    <div v-if="!search.trim()" class="space-y-6">
      <div>
        <p class="text-sm font-medium text-gray-500 mb-3">Populares</p>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            v-for="dest in popular"
            :key="dest.code"
            @click="toggle(dest)"
            class="relative flex items-center gap-3 p-4 rounded-xl border-2 bg-white transition-all duration-200"
            :class="isSelected(dest)
              ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
              : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
          >
            <div v-if="isSelected(dest)" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md" />
            <span class="font-medium" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500 mb-3">Todos los destinos</p>
        <div class="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
          <button
            v-for="dest in others"
            :key="dest.code"
            @click="toggle(dest)"
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
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md" />
            <span class="font-medium text-sm" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <p class="text-sm font-medium text-gray-500">{{ filtered.length }} resultados</p>
      <div class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        <button
          v-for="dest in filtered"
          :key="dest.code"
          @click="toggle(dest)"
          class="relative flex items-center gap-3 p-4 rounded-xl border-2 bg-white transition-all duration-200"
          :class="isSelected(dest)
            ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
            : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'"
        >
          <div v-if="isSelected(dest)" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
            <img :src="`https://flagcdn.com/w40/${dest.flag}.png`" :alt="dest.name" class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-md" />
          <span class="font-medium" :class="isSelected(dest) ? 'text-cyan-700' : 'text-gray-700'">{{ dest.name }}</span>
        </button>
      </div>
      <p v-if="filtered.length === 0" class="text-center text-gray-500 py-8">
        No encontramos "{{ search }}"
      </p>
    </div>

    <button
      @click="handleContinue"
      :disabled="selectedDestinations.length === 0"
      class="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <template v-if="selectedDestinations.length > 0">
        <span>Continuar ({{ selectedDestinations.length }} seleccionado{{ selectedDestinations.length > 1 ? 's' : '' }})</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
      <template v-else>
        <span>Selecciona al menos un destino</span>
      </template>
    </button>
  </div>
</template>