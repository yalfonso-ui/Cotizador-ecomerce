<script setup lang="ts">
import { computed } from 'vue'
import { STEPS } from '@/composables/useWizardSteps.js'

interface Country {
  code: string
  name: string
  flag: string
}

const props = defineProps<{
  origin: Country | null
  destination: Country[]
  dates: { start: string | null; end: string | null }
  travelersCount: number
  price: number
}>()

const emit = defineEmits<{
  edit: [step: number]
}>()

const originLabel = computed(() => props.origin?.name || null)
const destLabel = computed(() => {
  if (props.destination.length === 0) return null
  if (props.destination.length <= 2) return props.destination.map(d => d.name).join(', ')
  return `${props.destination[0].name} +${props.destination.length - 1}`
})
const routeComplete = computed(() => originLabel.value !== null && destLabel.value !== null)

const datesComplete = computed(() => !!(props.dates.start && props.dates.end))
const dateLabel = computed(() => {
  if (!datesComplete.value) return null
  const fmt = (d: string) => new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return `${fmt(props.dates.start!)} - ${fmt(props.dates.end!)}`
})

const travelersSet = computed(() => props.travelersCount > 0 && datesComplete.value)

const formattedPrice = computed(() => {
  if (!props.price) return null
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(props.price)
})
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-100 text-xs overflow-x-auto">
    <!-- Route -->
    <button
      type="button"
      @click="emit('edit', STEPS.ROUTE)"
      class="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 shrink-0 px-1.5 py-1 -mx-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      aria-label="Editar ruta"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <template v-if="routeComplete">
        <span class="font-medium truncate max-w-[120px]">{{ originLabel }}</span>
        <svg class="w-3 h-3 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-medium truncate max-w-[180px]">{{ destLabel }}</span>
      </template>
      <span v-else class="text-slate-300 italic">Pendiente de selección</span>
    </button>

    <!-- Dates separator + section -->
    <template v-if="datesComplete">
      <span class="w-px h-4 bg-slate-200 shrink-0"></span>

      <button
        type="button"
        @click="emit('edit', STEPS.DATES)"
        class="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 shrink-0 px-1.5 py-1 -mx-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-label="Editar fechas"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="font-medium">{{ dateLabel }}</span>
      </button>
    </template>

    <!-- Travelers separator + section -->
    <template v-if="travelersSet">
      <span class="w-px h-4 bg-slate-200 shrink-0"></span>

      <button
        type="button"
        @click="emit('edit', STEPS.TRAVELERS)"
        class="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 shrink-0 px-1.5 py-1 -mx-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        aria-label="Editar viajeros"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="font-medium">{{ travelersCount }} viajero{{ travelersCount !== 1 ? 's' : '' }}</span>
      </button>
    </template>

    <div class="flex-1"></div>

    <span v-if="formattedPrice" class="font-bold text-[#00184C] shrink-0">{{ formattedPrice }}</span>
  </div>
</template>
