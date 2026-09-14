<script setup>
/**
 * StepUpgrades — Selección de coberturas adicionales por viajero.
 *
 * NOTA DE DISEÑO (isInternalSync):
 * El patrón `isInternalSync` evita un loop infinito de reactividad entre
 * los watchers双向 de `travelersUpgrades ↔ modelValue`. Este flag es
 * un antipattern reconocido pero funcional; refactorizarlo requiere
 * rediseñar el estado del wizard (un sprint dedicado con tests).
 * No tocar sin revisar la cadena completa: toggleUpgrade → watch(local)
 *   → emit → watch(parent) → reasignación → watch(local).
 */
import { ref, computed, watch } from 'vue'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'
import { UPGRADE_OPTIONS as allUpgrades } from '@/data/upgrades.js'

import { useCurrencyStore, formatCurrency } from '@/stores/useCurrencyStore.js'

import preexistenciasImg from '@/assets/images/imagenes/Preexistencias.png'
import deportesImg from '@/assets/images/imagenes/Deportes y aventura.png'
import futuraMamaImg from '@/assets/images/imagenes/Futura mamá.png'

const imageMap = {
  preexistencias: preexistenciasImg,
  deportes: deportesImg,
  'futura-mama': futuraMamaImg,
  'cancelacion-multicausa': null
}

const emit = defineEmits(['update:modelValue', 'next'])

const props = defineProps({
  travelers: { type: [String, Number, Array], default: 'solo' },
  travelersCount: { type: Number, default: 1 },
  personalData: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const travelerCount = computed(() => resolveCount(props.travelers, props.travelersCount))

const upgradeOptions = allUpgrades
const fx = useCurrencyStore()
function fmt(usd) { return formatCurrency(usd, fx) }

// Recomendados para el botón "Agregar todos"
// Aquí: las upgrades con la mejor relación cobertura/precio. Marcadas
// como 'recommended' en data/upgrades.js en un futuro PR; mientras
// tanto, marcamos por defecto las primeras dos (preexistencias y
// cancelación, que son las que más valoran usuarios LATAM).
const RECOMMENDED_IDS = ['preexistencias', 'cancelacion-multicausa']

function isRecommended(id) { return RECOMMENDED_IDS.includes(id) }

function buildEmpty(count) {
  const next = {}
  for (let i = 1; i <= count; i++) {
    next[i] = []
  }
  return next
}

const travelersUpgrades = ref(buildEmpty(travelerCount.value))

// Flag para evitar el loop de reactividad entre watchers:
//   toggleUpgrade muta travelersUpgrades
//     → watch(travelersUpgrades) emite update:modelValue
//       → watch(props.modelValue) reasigna travelersUpgrades
//         → watch(travelersUpgrades) emite de nuevo ...
// Usamos este guard para que el watcher entrante no se re-emita
// a sí mismo. El primer set (desde el padre) se aplica; los
// siguientes (los que disparamos nosotros) se ignoran.
let isInternalSync = false

watch(() => props.modelValue, (val) => {
  if (isInternalSync) {
    isInternalSync = false
    return
  }
  if (!val || Object.keys(val).length === 0) {
    travelersUpgrades.value = buildEmpty(travelerCount.value)
    return
  }
  const incoming = { ...buildEmpty(travelerCount.value), ...val }
  travelersUpgrades.value = incoming
}, { deep: true })

watch(travelersUpgrades, (val) => {
  isInternalSync = true
  emit('update:modelValue', val)
}, { deep: true })

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

const allRecommendedSelectedForTraveler = (travelerId) => {
  const current = travelersUpgrades.value[travelerId] || []
  return RECOMMENDED_IDS.every(id => current.includes(id))
}

const allRecommendedSelectedGlobally = computed(() => {
  for (let i = 1; i <= travelerCount.value; i++) {
    if (!allRecommendedSelectedForTraveler(i)) return false
  }
  return travelerCount.value > 0
})

function addAllRecommended(travelerId) {
  const current = travelersUpgrades.value[travelerId] || []
  const merged = Array.from(new Set([...current, ...RECOMMENDED_IDS]))
  travelersUpgrades.value[travelerId] = merged
}

function clearAllForTraveler(travelerId) {
  travelersUpgrades.value[travelerId] = []
}

function clearAllGlobally() {
  for (let i = 1; i <= travelerCount.value; i++) {
    travelersUpgrades.value[i] = []
  }
}

function toggleAllRecommendedGlobally() {
  if (allRecommendedSelectedGlobally.value) {
    clearAllGlobally()
  } else {
    for (let i = 1; i <= travelerCount.value; i++) {
      addAllRecommended(i)
    }
  }
}

function travelerCompletion(travelerId) {
  // Estado de "viajero listo": al menos 1 upgrade marcada O explícitamente
  // declinó (no hay declinar explícito; usamos total > 0 como proxy).
  const total = getTravelerUpgradesTotal(travelerId)
  return {
    total,
    hasChoice: (travelersUpgrades.value[travelerId] || []).length > 0
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
  <div class="ds-focus-column max-w-5xl mx-auto space-y-8 w-full pt-6 md:pt-10">
    <div class="space-y-2">
      <span class="ds-eyebrow">Un paso más para tu tranquilidad</span>
      <h1 class="ds-heading-1">Lleva tu cobertura mucho<span style="color: #43D3FF;">  más lejos</span> </h1>
    </div>

    <div
      v-for="travelerId in travelerCount"
      :key="travelerId"
      class="w-full space-y-3 text-left"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style="background-color: #00184C;">
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="flex items-center justify-between flex-1">
          <h3 class="text-sm font-bold text-slate-900">{{ getTravelerName(travelerId) }}</h3>
          <div v-if="getTravelerUpgradesTotal(travelerId) > 0" class="text-sm font-bold text-slate-900">
            +{{ fmt(getTravelerUpgradesTotal(travelerId)) }}
          </div>
        </div>
        <button
          v-if="!allRecommendedSelectedForTraveler(travelerId)"
          type="button"
          @click.stop="addAllRecommended(travelerId)"
          class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
          style="background-color: #43D3FF; color: #00184C;"
        >
          + Agregar recomendados
        </button>
        <span
          v-else
          class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1"
          style="background-color: rgba(67, 211, 255, 0.18); color: #00184C;"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
          Recomendados ✓
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="upgrade in upgradeOptions"
          :key="upgrade.id"
          class="relative rounded-xl p-4 transition-colors duration-200 cursor-pointer bg-white flex items-start gap-3"
          :class="isSelected(travelerId, upgrade.id)
            ? 'border-2 border-blue-600 bg-blue-50'
            : 'border border-slate-200 hover:border-slate-300'"
          role="group"
          :aria-label="`${upgrade.title} para ${getTravelerName(travelerId)}`"
          @click="toggleUpgrade(travelerId, upgrade.id)"
          @keydown.space.prevent="toggleUpgrade(travelerId, upgrade.id)"
          @keydown.enter.prevent="toggleUpgrade(travelerId, upgrade.id)"
        >
          <div
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200"
            :style="isSelected(travelerId, upgrade.id)
              ? { backgroundColor: 'rgba(67, 211, 255, 0.12)' }
              : { backgroundColor: '#EDF4F9' }"
          >
            <img
              v-if="imageMap[upgrade.id]"
              :src="imageMap[upgrade.id]"
              :alt="upgrade.title"
              class="w-full h-full object-contain"
              loading="lazy"
            />
            <svg
              v-else
              class="w-10 h-10"
              :class="isSelected(travelerId, upgrade.id) ? 'text-[#00184C]' : 'text-slate-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-bold text-slate-900 leading-tight flex-1 min-w-0">{{ upgrade.title }}</h4>

              <button
                type="button"
                role="switch"
                :aria-checked="isSelected(travelerId, upgrade.id)"
                :aria-label="`Activar ${upgrade.title}`"
                @click.stop="toggleUpgrade(travelerId, upgrade.id)"
                @keydown.space.stop.prevent="toggleUpgrade(travelerId, upgrade.id)"
                @keydown.enter.stop.prevent="toggleUpgrade(travelerId, upgrade.id)"
                class="shrink-0 relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]/40"
                :style="isSelected(travelerId, upgrade.id)
                  ? { backgroundColor: '#00184C' }
                  : { backgroundColor: '#E2E8F0' }"
              >
                <span
                  class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
                  :class="isSelected(travelerId, upgrade.id) ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <p class="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{{ upgrade.description }}</p>

            <div class="flex items-end justify-between mt-3 pt-2 border-t border-slate-100">
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                  :style="isSelected(travelerId, upgrade.id) ? { color: '#00184C' } : { color: '#94A3B8' }"
                >Cobertura</p>
                <p class="text-xs font-semibold text-slate-700">{{ upgrade.coverage }}</p>
              </div>
              <p
                class="text-base font-black transition-colors"
                :style="isSelected(travelerId, upgrade.id) ? { color: '#00184C' } : { color: '#0F172A' }"
              >
                ${{ upgrade.price.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="grandTotal > 0" class="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total coberturas adicionales</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Se suma al precio del plan</p>
        </div>
        <div class="text-right">
          <p class="text-xl font-black text-slate-900">{{ fmt(grandTotal) }}</p>
        </div>
      </div>
    </div>

    <!-- Sugerencia opcional (no bloqueante): los upgrades son opcionales.
         El usuario puede continuar sin elegir ninguno. -->
    <div
      v-if="!hasAnyUpgrades"
      id="upgrades-help"
      class="w-full max-w-md mx-auto flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs"
      role="status"
      aria-live="polite"
    >
      <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>
        <span class="font-semibold">Tip:</span> las coberturas adicionales son opcionales.
        Puedes continuar al pago con tu plan base o agregar una si lo necesitas.
      </p>
    </div>

    <div class="w-full flex items-center justify-center pt-2">
      <button type="button"
        @click="handleNext"
        :aria-describedby="!hasAnyUpgrades ? 'upgrades-help' : undefined"
        class="bg-[#FFCC00] hover:bg-[#E6B800] text-slate-900 font-semibold text-base flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all duration-200 ease-out shadow-sm hover:-translate-y-px hover:shadow-md active:translate-y-0 active:scale-[0.98] w-full max-w-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2"
      >
        <span class="hidden md:inline">Continúa al pago</span>
        <span class="md:hidden">Ir al pago</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </div>
</template>