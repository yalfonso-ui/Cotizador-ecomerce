<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import CountrySelect from '@/components/ui/CountrySelect.vue'
import AppSpinner from '@/components/ui/AppSpinner.vue'

import { useIpGeolocation } from '@/composables/useIpGeolocation.js'

interface Country {
  code: string
  name: string
  flag: string
}

const props = withDefaults(
  defineProps<{
    originModel?: Country | null
    destinationModel?: Country[]
    maxDestinations?: number
  }>(),
  {
    originModel: null,
    destinationModel: () => [],
    maxDestinations: 5
  }
)

const emit = defineEmits<{
  'update:originModel': [value: Country | null]
  'update:destinationModel': [value: Country[]]
  next: [payload: { origin: Country; destination: Country[] }]
}>()

const originCountries: Country[] = [
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

const allDestinations: Country[] = [
  { code: 'US', name: 'Estados Unidos', flag: 'us' },
  { code: 'ES', name: 'España', flag: 'es' },
  { code: 'FR', name: 'Francia', flag: 'fr' },
  { code: 'IT', name: 'Italia', flag: 'it' },
  { code: 'GB', name: 'Reino Unido', flag: 'gb' },
  { code: 'DE', name: 'Alemania', flag: 'de' },
  { code: 'MX', name: 'México', flag: 'mx' },
  { code: 'BR', name: 'Brasil', flag: 'br' },
  { code: 'CA', name: 'Canadá', flag: 'ca' },
  { code: 'JP', name: 'Japón', flag: 'jp' },
  { code: 'AR', name: 'Argentina', flag: 'ar' },
  { code: 'CL', name: 'Chile', flag: 'cl' },
  { code: 'CO', name: 'Colombia', flag: 'co' },
  { code: 'PE', name: 'Perú', flag: 'pe' },
  { code: 'CH', name: 'Suiza', flag: 'ch' },
  { code: 'AU', name: 'Australia', flag: 'au' },
  { code: 'PT', name: 'Portugal', flag: 'pt' },
  { code: 'NL', name: 'Países Bajos', flag: 'nl' }
]

// Two-way bindings — empty by default, auto-detect by IP on mount
const origin = ref<Country | null>(props.originModel || null)
const destinations = ref<Country[]>(Array.isArray(props.destinationModel) ? [...props.destinationModel] : [])

// IP-based geolocation. Al cargar el step, intentamos detectar el país
// del usuario. Si el código detectado está en la lista de orígenes permitidos,
// lo pre-seleccionamos. Si el usuario ya tenía un origen (recargó la página
// con progreso guardado), no lo sobreescribimos.
const { country: detectedCountry, isDetecting, detect } = useIpGeolocation()

onMounted(() => {
  detect()
})

watch(detectedCountry, (val) => {
  if (!val || origin.value) return
  const match = originCountries.find(c => c.code === val.code)
  if (match) {
    origin.value = match
    emit('update:originModel', match)
  }
})

function updateOrigin(value) {
  origin.value = value
  emit('update:originModel', value)
}

function updateDestinations(value) {
  destinations.value = Array.isArray(value) ? value : []
  emit('update:destinationModel', destinations.value)
}

const canContinue = computed(() => origin.value !== null && destinations.value.length > 0)

function handleContinue() {
  if (!canContinue.value) return
  emit('next', {
    origin: origin.value,
    destination: destinations.value
  })
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto space-y-10 pt-6 md:pt-10" data-route-root>
    <header class="text-center space-y-2 pt-0">
      <p class="text-xs font-medium text-slate-500">Cuéntanos</p>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
        Define tu <span style="color: #43D3FF;">ruta</span>
      </h1>
    </header>

    <!-- StepHeader eliminado -->

    <!-- Indicador de detección de IP (auto-hide cuando completa) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isDetecting"
        class="flex items-center justify-center gap-2 text-xs text-slate-400 -mt-2"
        role="status"
        aria-live="polite"
      >
        <!--
          Spinner pequeño inline. SVG inline (AppSpinner) en vez del GIF
          porque a este tamaño (12px) el SVG es más nítido y liviano
          que un GIF de 122KB. Para prefers-reduced-motion, fallback al dot pulsante.
        -->
        <AppSpinner size="sm" class="text-[#43D3FF] motion-reduce:hidden" />
        <span
          class="motion-reduce:inline-flex hidden h-1.5 w-1.5 rounded-full bg-[#43D3FF] animate-pulse"
          aria-hidden="true"
        ></span>
        <span>Detectando tu país…</span>
      </div>
    </Transition>

    <!-- Horizontal layout: Origin + Destination side-by-side, identical styling -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <CountrySelect
        v-model="origin"
        :countries="originCountries"
        label="Origen"
        placeholder="País de origen"
        searchPlaceholder="País de origen"
        icon="origin"
        mode="single"
        @update:modelValue="updateOrigin"
      />

      <CountrySelect
        v-model="destinations"
        :countries="allDestinations"
        label="Destino"
        placeholder="País de destino"
        searchPlaceholder="País de destino"
        icon="destination"
        mode="multi"
        :max="maxDestinations"
        :disabled="!origin"
        :disabledReason="origin ? '' : 'Selecciona el origen primero'"
        @update:modelValue="updateDestinations"
      />
    </div>

    <!-- Continue button -->
    <div class="flex justify-center pt-2">
      <button
        type="button"
        @click="handleContinue"
        :disabled="!canContinue"
        class="inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-bold rounded-full transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :class="!canContinue
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-[#F9D35A] text-[#00184C] hover:brightness-95 shadow-sm focus-visible:ring-[#43D3FF]'"
      >
        <span v-if="!origin">Selecciona el origen</span>
        <span v-else-if="destinations.length === 0">Agrega un destino</span>
        <span v-else>Continuar</span>
        <svg
          v-if="origin && destinations.length > 0"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-current transform rotate-45"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      </button>
    </div>
  </div>
</template>