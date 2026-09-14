<script setup>
import { useCurrencyStore } from '@/stores/useCurrencyStore.js'
import AppIcon from '@/components/AppIcon.vue'

const currency = useCurrencyStore()
const setUSD = () => currency.setCurrency('USD')
const setCOP = () => currency.setCurrency('COP')
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 p-1 bg-slate-100 rounded-full border border-slate-200"
    role="group"
    aria-label="Selector de moneda"
  >
    <button
      type="button"
      @click="setUSD"
      :aria-pressed="currency.isUSD"
      :class="[
        'min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-full transition-all',
        currency.isUSD
          ? 'bg-[#00184C] text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      ]"
    >
      USD
    </button>
    <button
      type="button"
      @click="setCOP"
      :aria-pressed="currency.isCOP"
      :class="[
        'min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-full transition-all',
        currency.isCOP
          ? 'bg-[#00184C] text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      ]"
    >
      <AppIcon v-if="currency.isCOP" name="check" :size="12" class="inline -mt-0.5 mr-0.5" />
      COP
    </button>
  </div>
</template>
