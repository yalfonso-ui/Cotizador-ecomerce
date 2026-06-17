<script setup>
import { ref, computed, watch } from 'vue'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'

const emit = defineEmits(['update:modelValue', 'next'])

const props = defineProps({
  travelers: { type: [String, Number], default: 'solo' },
  travelersCount: { type: Number, default: 1 },
  personalData: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const travelerCount = computed(() => resolveCount(props.travelers, props.travelersCount))

function buildEmpty(count) {
  const next = {}
  for (let i = 1; i <= count; i++) {
    next[i] = []
  }
  return next
}

const travelersUpgrades = ref(buildEmpty(travelerCount.value))

watch(() => props.modelValue, (val) => {
  if (!val || Object.keys(val).length === 0) {
    travelersUpgrades.value = buildEmpty(travelerCount.value)
    return
  }
  const incoming = { ...buildEmpty(travelerCount.value), ...val }
  travelersUpgrades.value = incoming
}, { deep: true })

watch(travelersUpgrades, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

const upgradeOptions = [
  {
    id: 'preexistencias',
    title: 'Preexistencias médicas',
    description: 'Cobertura para condiciones médicas preexistentes declaradas.',
    coverage: 'USD 5,000',
    price: 18.20,
    color: 'rose',
    iconBg: 'bg-rose-100'
  },
  {
    id: 'deportes',
    title: 'Práctica deportiva',
    description: 'Actividades deportivas recreativas y de aventura.',
    coverage: 'USD 10,000',
    price: 14.50,
    color: 'sky',
    iconBg: 'bg-sky-100'
  },
  {
    id: 'futura-mama',
    title: 'Futura mamá',
    description: 'Coberturas especiales para embarazadas hasta semana 32.',
    coverage: 'USD 8,000',
    price: 22.00,
    color: 'pink',
    iconBg: 'bg-pink-100'
  },
  {
    id: 'equipaje-extra',
    title: 'Equipaje extra',
    description: 'Incrementa el límite por pérdida o daño de equipaje.',
    coverage: 'USD 2,500',
    price: 9.80,
    color: 'amber',
    iconBg: 'bg-amber-100'
  },
  {
    id: 'cancelacion-flex',
    title: 'Cancelación flexible',
    description: 'Cancela tu viaje hasta 48h antes sin penalización.',
    coverage: 'Cobertura total',
    price: 12.40,
    color: 'violet',
    iconBg: 'bg-violet-100'
  }
]

const colorMap = {
  rose: { selected: 'border-rose-400 bg-rose-50/40', toggle: 'bg-rose-500', dot: 'bg-rose-500' },
  sky: { selected: 'border-sky-400 bg-sky-50/40', toggle: 'bg-sky-500', dot: 'bg-sky-500' },
  pink: { selected: 'border-pink-400 bg-pink-50/40', toggle: 'bg-pink-500', dot: 'bg-pink-500' },
  amber: { selected: 'border-amber-400 bg-amber-50/40', toggle: 'bg-amber-500', dot: 'bg-amber-500' },
  violet: { selected: 'border-violet-400 bg-violet-50/40', toggle: 'bg-violet-500', dot: 'bg-violet-500' }
}

function toggleUpgrade(travelerId, upgradeId) {
  if (!travelersUpgrades.value[travelerId]) {
    travelersUpgrades.value[travelerId] = []
  }
  const idx = travelersUpgrades.value[travelerId].indexOf(upgradeId)
  if (idx > -1) {
    travelersUpgrades.value[travelerId].splice(idx, 1)
  } else {
    travelersUpgrades.value[travelerId].push(upgradeId)
  }
}

function isSelected(travelerId, upgradeId) {
  return travelersUpgrades.value[travelerId]?.includes(upgradeId) || false
}

function getTravelerUpgradesTotal(travelerId) {
  const selected = travelersUpgrades.value[travelerId] || []
  return selected.reduce((sum, id) => {
    const opt = upgradeOptions.find(o => o.id === id)
    return sum + (opt?.price || 0)
  }, 0)
}

function getTravelerName(travelerId) {
  const pd = props.personalData.find((_, i) => i + 1 === travelerId)
  return pd?.name || `Viajero ${travelerId}`
}

const grandTotal = computed(() => {
  let total = 0
  for (let i = 1; i <= travelerCount.value; i++) {
    total += getTravelerUpgradesTotal(i)
  }
  return total
})

const hasAnyUpgrades = computed(() => grandTotal.value > 0)

function handleNext() {
  const upgradesPerTraveler = {}
  for (let i = 1; i <= travelerCount.value; i++) {
    upgradesPerTraveler[i] = travelersUpgrades.value[i] || []
  }
  emit('next', { upgrades: upgradesPerTraveler })
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
      <p class="text-xs text-cyan-700 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Mejora la cobertura de tu asistencia con coberturas adicionales opcionales.
      </p>
    </div>

    <div
      v-for="travelerId in travelerCount"
      :key="travelerId"
      class="space-y-3"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="flex items-center justify-between flex-1">
          <h3 class="text-sm font-bold text-slate-700">{{ getTravelerName(travelerId) }}</h3>
          <div v-if="getTravelerUpgradesTotal(travelerId) > 0" class="text-sm font-bold text-cyan-600">
            +${{ getTravelerUpgradesTotal(travelerId).toFixed(2) }} USD
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div
          v-for="upgrade in upgradeOptions"
          :key="upgrade.id"
          class="relative border-2 rounded-xl p-3.5 transition-all duration-200 cursor-pointer"
          :class="isSelected(travelerId, upgrade.id)
            ? [colorMap[upgrade.color]?.selected || 'border-cyan-400 bg-cyan-50/40', 'shadow-sm']
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'"
          @click="toggleUpgrade(travelerId, upgrade.id)"
          role="checkbox"
          :aria-checked="isSelected(travelerId, upgrade.id)"
          :aria-label="`${upgrade.title} para ${getTravelerName(travelerId)}`"
          tabindex="0"
          @keydown.space.prevent="toggleUpgrade(travelerId, upgrade.id)"
          @keydown.enter.prevent="toggleUpgrade(travelerId, upgrade.id)"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-transform"
              :class="[upgrade.iconBg, isSelected(travelerId, upgrade.id) ? 'scale-105' : '']"
              aria-hidden="true"
            >
              <svg v-if="upgrade.id === 'preexistencias'" class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <svg v-else-if="upgrade.id === 'deportes'" class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else-if="upgrade.id === 'futura-mama'" class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <svg v-else-if="upgrade.id === 'equipaje-extra'" class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <svg v-else-if="upgrade.id === 'cancelacion-flex'" class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <h4 class="text-sm font-bold text-slate-800 leading-tight">{{ upgrade.title }}</h4>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{{ upgrade.description }}</p>
                </div>

                <div class="flex-shrink-0 flex flex-col items-end gap-1">
                  <div
                    class="relative inline-flex items-center w-11 h-6 rounded-full transition-all duration-200"
                    :class="isSelected(travelerId, upgrade.id)
                      ? [colorMap[upgrade.color]?.toggle || 'bg-cyan-500']
                      : 'bg-slate-200 hover:bg-slate-300'"
                    :aria-hidden="true"
                  >
                    <div
                      class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
                      :class="isSelected(travelerId, upgrade.id) ? 'translate-x-5' : 'translate-x-0'"
                    />
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cobertura</p>
                  <p class="text-xs font-semibold text-slate-600">{{ upgrade.coverage }}</p>
                </div>
                <p
                  class="text-sm font-black transition-colors"
                  :class="isSelected(travelerId, upgrade.id)
                    ? 'text-cyan-600'
                    : 'text-slate-700'"
                >
                  ${{ upgrade.price.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="isSelected(travelerId, upgrade.id)"
            class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
            :class="colorMap[upgrade.color]?.toggle || 'bg-cyan-500'"
            aria-hidden="true"
          >
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="grandTotal > 0" class="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total coberturas adicionales</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Se suma al precio del plan</p>
        </div>
        <div class="text-right">
          <p class="text-xl font-black text-cyan-600">${{ grandTotal.toFixed(2) }} <span class="text-xs text-slate-500 font-semibold">USD</span></p>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <button
        type="button"
        @click="$emit('next', { upgrades: {} })"
        class="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
      >
        Omitir y continuar
      </button>

      <button type="button"
        @click="handleNext"
        class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm flex items-center justify-center gap-2"
      >
        <span>Continuar</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  </div>
</template>