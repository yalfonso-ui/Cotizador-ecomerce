<script setup>
import { ref, computed } from 'vue'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'

const emit = defineEmits(['next', 'prev'])

const dateRange = ref([])
const isValid = computed(() => Array.isArray(dateRange.value) && !!dateRange.value[0] && !!dateRange.value[1])

const tripDays = computed(() => {
  if (!isValid.value) return 0
  const [start, end] = dateRange.value
  const diff = end.getTime() - start.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
})

function onDateChange(value) {
  dateRange.value = value || []
}

function formatDisplayDate(date) {
  return fmtDate(date)
}

function handleContinue() {
  if (!isValid.value) return
  const [start, end] = dateRange.value
  emit('next', {
    dates: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    },
    tripDuration: tripDays.value
  })
}
</script>

<template>
  <div class="ds-focus-column space-y-8">
    <div class="space-y-2">
      <span class="ds-eyebrow">Define tu ventana de viaje</span>
      <h1 class="ds-heading-1">¿Cuándo viajas?</h1>
    </div>

    <div v-if="isValid" class="w-full grid grid-cols-3 gap-4 py-4 border-y border-slate-100">
      <div class="text-center">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salida</p>
        <p class="text-sm font-semibold text-slate-900">{{ formatDisplayDate(dateRange[0]) }}</p>
      </div>
      <div class="text-center border-x border-slate-200">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duración</p>
        <p class="text-2xl font-black text-slate-900">{{ tripDays }} días</p>
      </div>
      <div class="text-center">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Regreso</p>
        <p class="text-sm font-semibold text-slate-900">{{ formatDisplayDate(dateRange[1]) }}</p>
      </div>
    </div>

    <DateRangePicker
      :modelValue="dateRange"
      @update:modelValue="onDateChange"
    />

    <button
      type="button"
      @click="handleContinue"
      :disabled="!isValid"
      class="ds-cta"
    >
      Continuar
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>

    <p v-if="!isValid" class="ds-helper text-center">
      Selecciona una fecha de inicio y fin para continuar
    </p>
  </div>
</template>