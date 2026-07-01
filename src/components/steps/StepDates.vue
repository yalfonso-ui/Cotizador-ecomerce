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
  if (!start || !end) return 0
  const normalize = (d) => {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    return date
  }
  const dateSalida = normalize(start)
  const dateRegreso = normalize(end)
  const diffTime = Math.abs(dateRegreso.getTime() - dateSalida.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
      <span class="ds-eyebrow">Marca las</span>
      <h1 class="ds-heading-1">Fechas de tu<span style="color: #43D3FF;"> viaje</span> </h1>
     
    </div>

    <DateRangePicker
      :modelValue="dateRange"
      @update:modelValue="onDateChange"
    />

    <div v-if="isValid" class="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl">
      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Vas a estar cubierto por</span>
      <span class="text-base font-black text-slate-900">{{ tripDays }} días</span>
    </div>

<button
      type="button"
      @click="handleContinue"
      :disabled="!isValid"
        class="mt-8 bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all hover:brightness-95 shadow-sm w-full max-w-md mx-auto disabled:bg-slate-200 disabled:text-slate-400"
    >
      <span class="hidden md:inline">Confirma tus fechas</span>
      <span class="md:hidden">Continuar</span>
      <svg v-if="isValid" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-white transform rotate-45">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
      </svg>
    </button>

    <p v-if="!isValid" class="ds-helper text-center">
      Elige tu salida y regreso para continuar.
    </p>
  </div>
</template>