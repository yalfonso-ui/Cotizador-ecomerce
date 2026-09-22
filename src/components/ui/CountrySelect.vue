<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Country {
  code: string
  name: string
  flag: string
}

interface Props {
  modelValue?: Country | Country[] | null
  countries: Country[]
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  mode?: 'single' | 'multi'
  max?: number
  disabled?: boolean
  disabledReason?: string
  icon?: 'origin' | 'destination'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  placeholder: 'Selecciona',
  searchPlaceholder: 'Busca un país',
  mode: 'single',
  max: 5,
  disabled: false,
  disabledReason: '',
  icon: 'origin'
})

const emit = defineEmits<{
  'update:modelValue': [value: Country | Country[] | null]
}>()

const isOpen = ref(false)
const search = ref('')
const searchId = `country-search-${Math.random().toString(36).slice(2, 9)}`
const rootId = `country-root-${Math.random().toString(36).slice(2, 9)}`
const listId = `country-list-${Math.random().toString(36).slice(2, 9)}`

const selectedSingle = computed<Country | null>(() => {
  if (props.mode !== 'single') return null
  return Array.isArray(props.modelValue) ? props.modelValue[0] ?? null : props.modelValue as Country | null
})

const selectedMulti = computed<Country[]>(() => {
  if (props.mode !== 'multi') return []
  if (Array.isArray(props.modelValue)) return [...props.modelValue]
  if (props.modelValue) return [props.modelValue as Country]
  return []
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.countries
  return props.countries.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
})

const atMaxCapacity = computed(() =>
  props.mode === 'multi' && selectedMulti.value.length >= props.max
)

const isSelected = (country: Country) => {
  if (props.mode === 'single') {
    return selectedSingle.value?.code === country.code
  }
  return selectedMulti.value.some(c => c.code === country.code)
}

function toggleCountry(country: Country) {
  if (props.disabled) return

  if (props.mode === 'single') {
    emit('update:modelValue', country)
    close()
    return
  }

  const list = selectedMulti.value
  const idx = list.findIndex(c => c.code === country.code)
  if (idx > -1) {
    emit('update:modelValue', list.filter(c => c.code !== country.code))
    return
  }
  if (atMaxCapacity.value) return
  emit('update:modelValue', [...list, country])
}

function removeChip(code: string, event?: Event) {
  if (event) event.stopPropagation()
  if (props.mode !== 'multi') return
  emit('update:modelValue', selectedMulti.value.filter(c => c.code !== code))
}

function clearAll(event?: Event) {
  if (event) event.stopPropagation()
  if (props.mode === 'multi') {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', null)
  }
}

function open() {
  if (props.disabled) return
  isOpen.value = true
  search.value = ''
  nextTick(() => {
    document.getElementById(searchId)?.focus()
  })
}

function close() {
  isOpen.value = false
  search.value = ''
}

function toggle() {
  if (isOpen.value) close()
  else open()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target) return
  if (!target.closest(`#${rootId}`)) return
  if (!target.closest(`[data-trigger="${rootId}"]`) && !target.closest(`[data-list="${rootId}"]`)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const collapsedSummary = computed(() => {
  if (props.mode === 'single') return null
  const list = selectedMulti.value
  if (list.length === 0) return null
  if (list.length <= 2) return list.map(c => c.name).join(', ')
  return `${list.slice(0, 2).map(c => c.name).join(', ')} +${list.length - 2}`
})

const hasSelection = computed(() => {
  if (props.mode === 'single') return selectedSingle.value !== null
  return selectedMulti.value.length > 0
})
</script>

<template>
  <div class="space-y-2" :id="rootId">
    <!-- Label -->
    <label
      v-if="label"
      class="flex items-center gap-1.5 text-xs font-medium text-slate-500"
    >
      <svg v-if="icon === 'origin'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else-if="icon === 'destination'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {{ label }}
    </label>

    <!-- Selected state (compact trigger) — single mode -->
    <button
      v-if="mode === 'single' && hasSelection && !isOpen"
      type="button"
      :data-testid="`${rootId}-trigger`"
      :data-trigger="rootId"
      @click="toggle"
      class="w-full bg-white border border-slate-200/80 rounded-2xl pl-3 pr-4 py-3 flex items-center justify-between hover:border-slate-300 transition-all duration-200 focus:outline-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
    >
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200/60">
          <img :src="`https://flagcdn.com/w80/${selectedSingle.flag}.png`" :alt="selectedSingle.name" class="w-full h-full object-cover" />
        </div>
        <span class="text-base font-semibold text-slate-900 truncate">{{ selectedSingle.name }}</span>
      </div>
      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
      </svg>
    </button>

    <!-- Selected state (compact trigger) — multi mode -->
    <button
      v-else-if="mode === 'multi' && hasSelection && !isOpen"
      type="button"
      :data-testid="`${rootId}-trigger`"
      :data-trigger="rootId"
      @click="open"
      class="w-full bg-white border border-slate-200/80 rounded-2xl pl-3 pr-3 py-2.5 flex items-center justify-between gap-2 hover:border-slate-300 transition-all duration-200 focus:outline-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
    >
      <!-- Stacked flag avatars + first name -->
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <div class="flex -space-x-1.5 shrink-0">
          <div
            v-for="(country, idx) in selectedMulti.slice(0, 3)"
            :key="country.code"
            class="w-7 h-7 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white"
            :style="idx > 0 ? `z-index: ${10 - idx}` : ''"
          >
            <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-full h-full object-cover" />
          </div>
        </div>
        <span class="text-base font-semibold text-slate-900 truncate min-w-0">{{ collapsedSummary }}</span>
      </div>
      <span class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          @click.stop="clearAll"
          class="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          :aria-label="`Limpiar ${label}`"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
        </svg>
      </span>
    </button>

    <!-- Empty / disabled state -->
    <button
      v-else-if="!isOpen"
      type="button"
      :data-testid="`${rootId}-trigger`"
      :data-trigger="rootId"
      @click="open"
      :disabled="disabled"
      class="w-full bg-white border border-dashed rounded-2xl px-4 py-3.5 flex items-center justify-between transition-all duration-200 focus:outline-none focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
      :class="disabled
        ? 'bg-slate-50 border-slate-200 cursor-not-allowed text-slate-300'
        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50 text-slate-400'"
    >
      <span class="text-base font-medium">
        {{ disabled ? disabledReason : placeholder }}
      </span>
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" :class="disabled ? 'text-slate-300' : 'text-slate-400'">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Open state: search + list + Hecho button (multi mode) -->
    <div v-else class="space-y-2">
      <div class="relative">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          :id="searchId"
          v-model="search"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full h-12 pl-10 pr-10 text-base bg-white border border-slate-200/80 rounded-2xl placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200"
          autocomplete="off"
        />
        <button
          type="button"
          @click="close"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          aria-label="Cerrar buscador"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Selected chip row + Hecho button (multi mode, sticky-style row) -->
      <div
        v-if="mode === 'multi' && selectedMulti.length > 0"
        class="flex items-center justify-between gap-3 py-2"
        aria-live="polite"
        aria-atomic="false"
      >
        <div class="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          <button
            v-for="country in selectedMulti.slice(0, 3)"
            :key="`chip-${country.code}`"
            type="button"
            @click="toggleCountry(country)"
            class="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full pl-1 pr-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
            :aria-label="`Quitar ${country.name}`"
          >
            <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="''" class="w-4 h-4 rounded-full object-cover ring-1 ring-white" />
            <span>{{ country.name }}</span>
            <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span
            v-if="selectedMulti.length > 3"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100"
          >
            +{{ selectedMulti.length - 3 }}
          </span>
        </div>

        <button
          type="button"
          @click="close"
          class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00184C] text-white text-sm font-bold hover:bg-[#002a6e] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF] focus-visible:ring-offset-2"
        >
          <span>Hecho</span>
          <span
            v-if="selectedMulti.length > 1"
            class="text-[10px] font-bold uppercase tracking-wider text-[#43D3FF]"
            aria-hidden="true"
          >{{ selectedMulti.length }}</span>
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div :data-list="rootId" class="bg-white border border-slate-200/80 rounded-2xl max-h-[55vh] md:max-h-72 overflow-y-auto overscroll-contain">
        <button
          v-for="country in filtered"
          :key="country.code"
          type="button"
          @click="toggleCountry(country)"
          :disabled="mode === 'multi' && atMaxCapacity && !isSelected(country)"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-100 last:border-0"
          :class="mode === 'multi' && atMaxCapacity && !isSelected(country)
            ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
            : 'hover:bg-slate-50'"
        >
          <span
            v-if="mode === 'multi'"
            class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0"
            :class="isSelected(country) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'"
          >
            <svg v-if="isSelected(country)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div class="w-7 h-7 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200/60">
            <img :src="`https://flagcdn.com/w40/${country.flag}.png`" :alt="country.name" class="w-full h-full object-cover" />
          </div>
          <span class="flex-1 text-sm font-medium text-slate-700">{{ country.name }}</span>
          <svg v-if="mode === 'single' && isSelected(country)" class="w-4 h-4 text-slate-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
        <p v-if="filtered.length === 0" class="text-center text-slate-400 py-6 text-sm">
          Sin resultados para "{{ search }}"
        </p>
      </div>

      <!-- Max capacity notice -->
      <div v-if="mode === 'multi' && atMaxCapacity" class="px-4 py-2.5 -mt-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500">
        Máximo de {{ max }} seleccionados. Quita uno para agregar otro.
      </div>
    </div>
  </div>
</template>