<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

interface Country {
  code: string
  name: string
  flag: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: Country[]
    maxDestinations?: number
  }>(),
  {
    modelValue: () => [],
    maxDestinations: 5,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: Country[]]
  next: [payload: { destination: Country[] }]
}>()

const MAX_DESTINATIONS = props.maxDestinations

const searchQuery = ref<string>('')
const isOpen = ref<boolean>(false)
const selectedCountries = ref<Country[]>(Array.isArray(props.modelValue) ? [...props.modelValue] : [])

const allCountries: Country[] = [
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
  { code: 'NL', name: 'Países Bajos', flag: 'nl' },
]

const popularDestinations: Country[] = [
  { code: 'ES', name: 'España', flag: 'es' },
  { code: 'US', name: 'Estados Unidos', flag: 'us' },
  { code: 'FR', name: 'Francia', flag: 'fr' },
  { code: 'IT', name: 'Italia', flag: 'it' },
]

const isSearching = computed<boolean>(() => searchQuery.value.trim().length > 0)

const filteredCountries = computed<Country[]>(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return allCountries
  return allCountries.filter(
    (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)
  )
})

const atMaxCapacity = computed<boolean>(
  () => selectedCountries.value.length >= MAX_DESTINATIONS
)

const collapsedDisplay = computed<string>(() => {
  const list = selectedCountries.value
  if (list.length === 0) return ''
  if (list.length <= 2) return list.map((c) => c.name).join(', ')
  const visible = list.slice(0, 2).map((c) => c.name).join(', ')
  return `${visible} +${list.length - 2}`
})

function isSelected(country: Country): boolean {
  return selectedCountries.value.some((c) => c.code === country.code)
}

function toggleCountry(country: Country): void {
  if (isSelected(country)) {
    selectedCountries.value = selectedCountries.value.filter(
      (c) => c.code !== country.code
    )
    return
  }
  if (atMaxCapacity.value) return
  selectedCountries.value = [...selectedCountries.value, country]
}

function removeCountry(code: string): void {
  selectedCountries.value = selectedCountries.value.filter((c) => c.code !== code)
}

function clearAll(): void {
  selectedCountries.value = []
  searchQuery.value = ''
}

function openDropdown(): void {
  isOpen.value = true
  searchQuery.value = ''
}

function handleDone(): void {
  isOpen.value = false
  searchQuery.value = ''
}

function handleWrapperClick(): void {
  if (!isOpen.value) {
    isOpen.value = true
    searchQuery.value = ''
  }
}

function handleClearSearch(): void {
  searchQuery.value = ''
}

function handleContinue(): void {
  if (selectedCountries.value.length === 0) return
  emit('next', { destination: selectedCountries.value })
}

function handleClickOutside(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (!target.closest('[data-destination-root]')) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

watch(
  selectedCountries,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)
</script>

<template>
  <div class="ds-focus-column space-y-6" data-destination-root>
    <span class="ds-eyebrow">Selecciona tus destinos</span>
    <h1 class="ds-heading-1">¿A dónde viajas?</h1>

    <div class="w-full space-y-2">
      <div class="relative">
        <div
          data-testid="destination-trigger"
          class="ds-selector"
          :class="isOpen ? 'border-[color:var(--ds-focus)] ring-2 ring-[color:var(--ds-focus-ring)]' : ''"
          @click="handleWrapperClick"
        >
          <svg
            class="w-5 h-5 text-slate-400 shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <div class="flex-1 mx-3 min-w-0 text-left">
            <div
              v-if="!isOpen && selectedCountries.length > 0"
              class="flex items-center gap-2 truncate"
            >
              <span class="text-base text-slate-900 truncate">{{ collapsedDisplay }}</span>
            </div>
            <input
              v-else
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="selectedCountries.length === 0 ? 'Selecciona un país o región' : 'Añade otro destino'"
              class="w-full text-base text-slate-900 placeholder:text-slate-400 bg-transparent border-0 outline-none focus:ring-0 p-0"
              autocomplete="off"
            />
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="!isOpen && selectedCountries.length > 0"
              type="button"
              @click.stop="clearAll"
              class="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
              aria-label="Limpiar selección"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <svg
              class="w-4 h-4 text-slate-400 transition-transform duration-200"
              :class="isOpen ? 'rotate-180' : 'rotate-0'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div
          v-if="isOpen"
          class="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-slate-200 rounded-xl overflow-hidden"
        >
          <div
            v-if="selectedCountries.length > 0"
            class="px-3 py-2 border-b border-slate-100 flex flex-wrap items-center gap-2"
          >
            <span
              v-for="country in selectedCountries"
              :key="`pill-${country.code}`"
              class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 rounded-full pl-2.5 pr-1 py-1 text-sm"
            >
              <img
                :src="`https://flagcdn.com/w40/${country.flag}.png`"
                :alt="''"
                class="w-4 h-4 rounded-full object-cover"
              />
              <span class="font-medium">{{ country.name }}</span>
              <button
                type="button"
                @click.stop="removeCountry(country.code)"
                class="w-5 h-5 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
                :aria-label="`Quitar ${country.name}`"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>

            <button
              type="button"
              @click="handleDone"
              class="ml-auto px-4 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-focus)]"
            >
              Hecho
            </button>
          </div>

          <div class="p-3 border-b border-slate-100">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Busca un país o región"
              class="w-full h-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-[color:var(--ds-focus)] focus:outline-none transition-colors duration-150"
              autocomplete="off"
            />
          </div>

          <div class="max-h-60 overflow-y-auto py-1">
            <template v-if="!isSearching">
              <p class="px-4 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Destinos principales
              </p>
              <button
                v-for="country in popularDestinations"
                :key="`pop-${country.code}`"
                type="button"
                @click="toggleCountry(country)"
                :disabled="atMaxCapacity && !isSelected(country)"
                class="w-full flex items-center gap-3 py-3 px-4 text-left transition-colors duration-100 hover:bg-slate-50 disabled:hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-slate-50"
              >
                <span
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0"
                  :class="isSelected(country)
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-white border-slate-300'"
                >
                  <svg
                    v-if="isSelected(country)"
                    class="w-3 h-3 text-white"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <img
                  :src="`https://flagcdn.com/w40/${country.flag}.png`"
                  :alt="''"
                  class="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <span class="flex-1 text-sm font-medium text-slate-700">{{ country.name }}</span>
              </button>
            </template>

            <template v-else>
              <p class="px-4 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                {{ filteredCountries.length }} resultado{{ filteredCountries.length === 1 ? '' : 's' }}
              </p>
              <p
                v-if="filteredCountries.length === 0"
                class="text-center text-sm text-slate-500 py-8"
              >
                No encontramos resultados para "{{ searchQuery }}"
              </p>
              <button
                v-for="country in filteredCountries"
                :key="`res-${country.code}`"
                type="button"
                @click="toggleCountry(country)"
                :disabled="atMaxCapacity && !isSelected(country)"
                class="w-full flex items-center gap-3 py-3 px-4 text-left transition-colors duration-100 hover:bg-slate-50 disabled:hover:bg-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:bg-slate-50"
              >
                <span
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shrink-0"
                  :class="isSelected(country)
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-white border-slate-300'"
                >
                  <svg
                    v-if="isSelected(country)"
                    class="w-3 h-3 text-white"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <img
                  :src="`https://flagcdn.com/w40/${country.flag}.png`"
                  :alt="''"
                  class="w-6 h-6 rounded-full object-cover shrink-0"
                />
                <span class="flex-1 text-sm font-medium text-slate-700">{{ country.name }}</span>
              </button>
            </template>
          </div>

          <div
            v-if="atMaxCapacity"
            class="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2"
            role="status"
          >
            <svg class="w-4 h-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Máximo de {{ MAX_DESTINATIONS }} destinos. Quita uno para agregar otro.</span>
          </div>
        </div>
      </div>

      <p
        v-if="!isOpen && selectedCountries.length === 0"
        class="ds-helper text-center"
      >
        Selecciona hasta {{ MAX_DESTINATIONS }} destinos para tu viaje.
      </p>
    </div>

    <button
      type="button"
      @click="handleContinue"
      :disabled="selectedCountries.length === 0"
      class="ds-cta"
    >
      <span v-if="selectedCountries.length > 0">
        Continuar
        <span v-if="selectedCountries.length > 1" class="text-sm font-medium opacity-80 ml-1">
          ({{ selectedCountries.length }} destinos)
        </span>
      </span>
      <span v-else>Selecciona un destino</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</template>
