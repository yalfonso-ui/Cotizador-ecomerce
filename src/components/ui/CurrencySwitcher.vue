<script setup>
import { useCurrencyStore } from '@/stores/useCurrencyStore.js'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  /** 'light' = fondo claro (default wizard), 'dark' = fondo oscuro (landing) */
  variant: { type: String, default: 'light', validator: v => ['light', 'dark'].includes(v) }
})

const currency = useCurrencyStore()
const setUSD = () => currency.setCurrency('USD')
const setCOP = () => currency.setCurrency('COP')
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 p-1 rounded-full border"
    :class="variant === 'dark'
      ? 'border-white/15'
      : 'bg-slate-100 border-slate-200'"
    :style="variant === 'dark' ? { backgroundColor: 'rgba(255,255,255,0.06)' } : {}"
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
          ? (variant === 'dark'
              ? 'bg-white text-[#00184C] shadow-sm'
              : 'bg-[#00184C] text-white shadow-sm')
          : (variant === 'dark'
              ? 'text-white/80 hover:text-white'
              : 'text-slate-500 hover:text-slate-700')
      ]"
    >USD</button>
    <button
      type="button"
      @click="setCOP"
      :aria-pressed="currency.isCOP"
      :class="[
        'min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-full transition-all',
        currency.isCOP
          ? (variant === 'dark'
              ? 'bg-white text-[#00184C] shadow-sm'
              : 'bg-[#00184C] text-white shadow-sm')
          : (variant === 'dark'
              ? 'text-white/80 hover:text-white'
              : 'text-slate-500 hover:text-slate-700')
      ]"
    >
      <AppIcon v-if="currency.isCOP" name="check" :size="12" class="inline -mt-0.5 mr-0.5" />
      COP
    </button>
  </div>
</template>
