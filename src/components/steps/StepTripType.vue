<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])
const props = defineProps({
  modelValue: { type: String, default: null }
})

const tripTypes = [
  {
    id: 'short',
    icon: '🏖️',
    iconBg: 'bg-amber-100',
    title: 'Viaje corto',
    description: 'Escapadas y vacaciones de pocos días.',
    coverage: '1 - 60 días',
    price: 25,
    accent: 'cyan',
    accentClass: 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-500/20',
    iconAccent: 'bg-cyan-500',
    hoverClass: 'hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-md hover:-translate-y-0.5'
  },
  {
    id: 'long',
    icon: '✈️',
    iconBg: 'bg-blue-100',
    title: 'Larga duración',
    description: 'Viajes de estudios, mochileros o expatriados.',
    coverage: '61 - 365 días',
    price: 40,
    accent: 'blue',
    accentClass: 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20',
    iconAccent: 'bg-blue-500',
    hoverClass: 'hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md hover:-translate-y-0.5'
  },
  {
    id: 'annual',
    icon: '📅',
    iconBg: 'bg-indigo-100',
    title: 'Anual Multiviaje',
    description: 'Para quienes realizan varios viajes en el año.',
    coverage: 'Multiviajes (1 año)',
    price: 65,
    accent: 'indigo',
    accentClass: 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20',
    iconAccent: 'bg-indigo-500',
    hoverClass: 'hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-md hover:-translate-y-0.5',
    badge: 'MÁS POPULAR'
  }
]

const selected = ref(props.modelValue || 'short')
const hoveredId = ref(null)

const selectedType = computed(() => 
  tripTypes.find(t => t.id === selected.value) || null
)

function select(type) {
  selected.value = type.id
}

function handleContinue() {
  if (selected.value) {
    emit('next', { tripType: selected.value })
  }
}
</script>

<template>
  <div class="space-y-5">
    <div role="radiogroup" aria-label="Tipo de viaje" class="grid gap-3">
      <button
        v-for="type in tripTypes"
        :key="type.id"
        type="button"
        role="radio"
        :aria-checked="selected === type.id"
        :aria-label="`${type.title}: ${type.description}, cobertura ${type.coverage}, desde ${type.price} dólares`"
        @click="select(type)"
        @mouseenter="hoveredId = type.id"
        @mouseleave="hoveredId = null"
        class="relative flex items-center gap-4 p-4 rounded-2xl border-2 bg-white transition-all duration-300 ease-out text-left w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
        :class="selected === type.id
          ? type.accentClass
          : `border-slate-100 ${type.hoverClass}`"
      >
        <div v-if="type.badge" class="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
          {{ type.badge }}
        </div>

        <div
          v-if="selected === type.id"
          class="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
          :class="type.iconAccent"
          aria-hidden="true"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div
          class="flex items-center justify-center w-14 h-14 rounded-xl text-2xl flex-shrink-0 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3"
          :class="[type.iconBg, selected === type.id ? 'scale-105' : '']"
          aria-hidden="true"
        >
          {{ type.icon }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-800 text-base leading-tight transition-colors duration-200"
            :class="hoveredId === type.id && selected !== type.id ? `text-${type.accent}-700` : ''">
            {{ type.title }}
          </p>
          <p class="text-xs text-slate-500 mt-1 leading-snug">{{ type.description }}</p>
        </div>

        <div class="text-right flex-shrink-0 pl-2">
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cobertura</p>
          <p class="text-sm font-normal text-slate-500 mt-0.5">{{ type.coverage }}</p>
          <p class="text-[19px] font-bold text-slate-800 mt-1.5 leading-none transition-transform duration-200"
            :class="hoveredId === type.id ? 'scale-105 inline-block' : ''">
            Desde <span :class="`text-${type.accent}-600`">${{ type.price }}</span>
          </p>
        </div>
      </button>
    </div>

    <div class="flex justify-center pt-2">
      <button
        type="button"
        @click="handleContinue"
        :disabled="!selected"
        class="group w-full sm:w-auto min-w-[280px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 hover:shadow-lg hover:shadow-yellow-400/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 disabled:hover:shadow-sm disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center justify-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
      >
        <template v-if="selectedType">
          <span>Continuar con {{ selectedType.title }}</span>
          <svg class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </template>
        <template v-else>
          <span>Selecciona un tipo de viaje</span>
        </template>
      </button>
    </div>
  </div>
</template>
