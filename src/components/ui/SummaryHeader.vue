<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWizardStore } from '@/stores/useWizardStore.js'
import { getPlanPrice } from '@/data/plans.js'
import { useCurrencyStore, formatCurrency } from '@/stores/useCurrencyStore.js'

const wizardStore = useWizardStore()
const { formData } = storeToRefs(wizardStore)
const fx = useCurrencyStore()

const originLabel = computed(() => formData.value.origin?.name || null)
const destLabel = computed(() => {
  const dest = formData.value.destination
  if (!dest || dest.length === 0) return null
  if (dest.length <= 2) return dest.map(d => d.name).join(', ')
  return `${dest[0].name} +${dest.length - 1}`
})

const hasDates = computed(() => !!(formData.value.dates?.start && formData.value.dates?.end))
const dateLabel = computed(() => {
  if (!hasDates.value) return null
  const fmt = (d) => new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return `${fmt(formData.value.dates.start)} - ${fmt(formData.value.dates.end)}`
})

const titularComplete = computed(() => {
  const info = formData.value.travelersInfo?.[0]
  if (!info) return false
  const name = (info.name || '').trim()
  const email = (info.email || '').trim()
  const phone = (info.phone || '').trim()
  return name.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.replace(/\D/g, '').length >= 10
})

const travelersLabel = computed(() => {
  const n = formData.value.birthdates?.length || formData.value.travelersCount || 0
  if (!n) return null
  return `${n} viajero${n !== 1 ? 's' : ''}`
})

const price = computed(() => getPlanPrice(formData.value.selectedPlan))
const formattedPrice = computed(() => {
  if (!price.value) return null
  return formatCurrency(price.value, fx)
})
</script>

<template>
  <div
    v-if="wizardStore.hasTravelSummary"
    class="hidden sm:flex items-center gap-2 text-[11px] text-slate-600 leading-none"
  >
    <!-- Origin → Destination -->
    <div class="flex items-center gap-1 shrink-0">
      <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <span class="font-medium truncate max-w-[80px]">{{ originLabel }}</span>
      <svg class="w-2.5 h-2.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
      <span class="font-medium truncate max-w-[120px]">{{ destLabel }}</span>
    </div>

    <!-- Dates -->
    <template v-if="hasDates">
      <span class="w-px h-3 bg-slate-200 shrink-0"></span>
      <div class="flex items-center gap-1 shrink-0">
        <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="font-medium tabular-nums">{{ dateLabel }}</span>
      </div>
    </template>

    <!-- Travelers -->
    <template v-if="travelersLabel">
      <span class="w-px h-3 bg-slate-200 shrink-0"></span>
      <div class="flex items-center gap-1 shrink-0 whitespace-nowrap">
        <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="font-medium">{{ travelersLabel }}</span>
      </div>
    </template>

    <!-- Price -->
    <template v-if="formattedPrice">
      <span class="w-px h-3 bg-slate-200 shrink-0"></span>
      <div class="flex items-center gap-1 shrink-0">
        <span class="font-bold tabular-nums" style="color: #00184C;">{{ formattedPrice }}</span>
      </div>
    </template>
  </div>
</template>
