<script setup>
import { ref, computed, watch } from 'vue'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'
import { UPGRADE_OPTIONS as allUpgrades } from '@/data/upgrades.js'

import preexistenciasImg from '@/assets/images/imagenes/Preexistencias.png'
import deportesImg from '@/assets/images/imagenes/Deportes y aventura.png'
import futuraMamaImg from '@/assets/images/imagenes/Futura mamá.png'

const imageMap = {
  preexistencias: preexistenciasImg,
  deportes: deportesImg,
  'futura-mama': futuraMamaImg
}

const emit = defineEmits(['update:modelValue', 'next'])

const props = defineProps({
  travelers: { type: [String, Number], default: 'solo' },
  travelersCount: { type: Number, default: 1 },
  personalData: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const travelerCount = computed(() => resolveCount(props.travelers, props.travelersCount))

const upgradeOptions = allUpgrades.filter(u => imageMap[u.id])

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
  <div class="ds-focus-column max-w-5xl mx-auto space-y-8 w-full">
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
            +${{ getTravelerUpgradesTotal(travelerId).toFixed(2) }} USD
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="upgrade in upgradeOptions"
          :key="upgrade.id"
          class="relative border rounded-xl p-4 transition-colors duration-200 cursor-pointer bg-white flex items-start gap-3"
          :class="isSelected(travelerId, upgrade.id)
            ? 'border-2'
            : 'border border-slate-200 hover:border-slate-300'"
          :style="isSelected(travelerId, upgrade.id)
            ? { borderColor: '#00184C', backgroundColor: 'rgba(67, 211, 255, 0.04)' }
            : {}"
          @click="toggleUpgrade(travelerId, upgrade.id)"
          role="checkbox"
          :aria-checked="isSelected(travelerId, upgrade.id)"
          :aria-label="`${upgrade.title} para ${getTravelerName(travelerId)}`"
          tabindex="0"
          @keydown.space.prevent="toggleUpgrade(travelerId, upgrade.id)"
          @keydown.enter.prevent="toggleUpgrade(travelerId, upgrade.id)"
        >
          <div
            class="w-20 h-20 rounded-lg flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-200"
            :style="isSelected(travelerId, upgrade.id)
              ? { backgroundColor: 'rgba(67, 211, 255, 0.12)' }
              : { backgroundColor: '#EDF4F9' }"
          >
            <img
              :src="imageMap[upgrade.id]"
              :alt="upgrade.title"
              class="w-full h-full object-contain"
              loading="lazy"
            />
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
                class="shrink-0 relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2"
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
          <p class="text-xl font-black text-slate-900">${{ grandTotal.toFixed(2) }} <span class="text-xs text-slate-500 font-semibold">USD</span></p>
        </div>
      </div>
    </div>

    <div class="w-full flex items-center justify-center pt-2">
      <button type="button"
        @click="handleNext"
        class="bg-[#FFCC00] hover:bg-[#E6B800] text-slate-900 font-semibold text-base flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all active:scale-[0.99] shadow-sm w-full max-w-md disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00] focus-visible:ring-offset-2"
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