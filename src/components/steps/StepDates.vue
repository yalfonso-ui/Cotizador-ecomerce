<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'

const emit = defineEmits(['next', 'prev'])
const props = defineProps({
  tripClassification: { type: String, default: null }
})

const dateRange = ref([])
const startDate = ref(null)
const minDate = new Date()

const endDate = computed(() => {
  if (!startDate.value) return null
  return dateRange.value[1] || null
})

const isValid = computed(() => !!startDate.value && !!endDate.value)

const tripDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
})

const isMobile = ref(false)
let mql = null
const updateMobile = (e) => { isMobile.value = e.matches }

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mql.matches
    if (mql.addEventListener) mql.addEventListener('change', updateMobile)
    else mql.addListener(updateMobile)
  }
})

onUnmounted(() => {
  if (!mql) return
  if (mql.removeEventListener) mql.removeEventListener('change', updateMobile)
  else mql.removeListener(updateMobile)
})

function formatDisplayDate(date) {
  return fmtDate(date)
}

function onDateSelect(value) {
  dateRange.value = value
  if (Array.isArray(value)) {
    startDate.value = value[0] || null
  }
}

function handleContinue() {
  if (!isValid.value) return
  const start = startDate.value ? new Date(startDate.value) : null
  const end = endDate.value ? new Date(endDate.value) : null
  emit('next', {
    dates: {
      start: start ? start.toISOString().split('T')[0] : null,
      end: end ? end.toISOString().split('T')[0] : null
    },
    tripDuration: tripDays.value
  })
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isValid" class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl items-center border border-slate-100">
      <div class="text-center">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salida</p>
        <p class="text-sm font-semibold text-slate-700">{{ formatDisplayDate(startDate) }}</p>
      </div>
      <div class="text-center border-x border-slate-200">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duración</p>
        <p class="text-2xl font-black text-cyan-600">{{ tripDays }} días</p>
      </div>
      <div class="text-center">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Regreso</p>
        <p class="text-sm font-semibold text-slate-700">{{ formatDisplayDate(endDate) }}</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <DatePicker
        v-model="dateRange"
        @update:modelValue="onDateSelect"
        selectionMode="range"
        :inline="true"
        :manualInput="false"
        :minDate="minDate"
        :numberOfMonths="isMobile ? 1 : 2"
        :showWeek="false"
        class="w-full"
        inputClass="hidden"
        panelClass="rounded-xl shadow-xl border-0"
        dateFormat="dd/mm/yy"
        :showIcon="false"
      />
    </div>

    <button
      type="button"
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      Continuar
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>

    <p v-if="!isValid" class="text-center text-xs text-slate-500 mt-3">
      Selecciona una fecha de inicio y fin para continuar
    </p>
  </div>
</template>

<style scoped>
:deep(.p-datepicker) {
  border: none !important;
  background: transparent !important;
}

:deep(.p-datepicker-header) {
  background: transparent !important;
  border: none !important;
}

:deep(.p-datepicker-calendar td) {
  padding: 2px !important;
}

:deep(.p-datepicker-calendar td > span) {
  width: 2.5rem !important;
  height: 2.5rem !important;
}

:deep(.p-datepicker-range-start),
:deep(.p-datepicker-range-end) {
  background-color: secondary-300 !important;
  border-color: secondary-300 !important;
}

:deep(.p-highlight) {
  background-color: secondary-300 !important;
  border-color: secondary-300 !important;
}

:deep(.p-datepicker-range) {
  background-color: rgba(0, 187, 249, 0.15) !important;
}

:deep(.p-datepicker-day-selected) {
  background-color: secondary-300 !important;
  color: white !important;
}

:deep(.p-datepicker-day:hover) {
  background-color: rgba(0, 187, 249, 0.1) !important;
}
</style>
