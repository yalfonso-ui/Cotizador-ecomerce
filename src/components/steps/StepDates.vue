<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next', 'prev'])

const dateRange = ref([])
const minDate = new Date()

const startDate = computed(() => dateRange.value[0] || null)
const endDate = computed(() => dateRange.value[1] || null)

const isValid = computed(() => !!startDate.value && !!endDate.value)

const tripDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
})

function formatDisplayDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace('.', '')
}

function handleContinue() {
  if (isValid.value) {
    emit('next', {
      dates: {
        start: startDate.value ? new Date(startDate.value).toISOString().split('T')[0] : null,
        end: endDate.value ? new Date(endDate.value).toISOString().split('T')[0] : null
      }
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <DatePicker
        v-model="dateRange"
        selectionMode="range"
        :inline="true"
        :manualInput="false"
        :minDate="minDate"
        :numberOfMonths="2"
        :showWeek="false"
        class="w-full"
        inputClass="hidden"
        panelClass="rounded-xl shadow-xl border-0"
        dateFormat="dd/mm/yy"
        :showIcon="false"
      />
    </div>

    <div v-if="isValid" class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl items-center">
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

    <button
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      Continuar
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>

    <button
      @click="$emit('prev')"
      class="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Volver al paso anterior
    </button>

    <div class="flex items-center justify-center gap-6 pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2 text-slate-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span class="text-xs font-medium">Pago Seguro</span>
      </div>
      <div class="flex items-center gap-2 text-slate-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span class="text-xs font-medium">Asistencia 24/7</span>
      </div>
    </div>
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
  background-color: #00bbf9 !important;
  border-color: #00bbf9 !important;
}

:deep(.p-highlight) {
  background-color: #00bbf9 !important;
  border-color: #00bbf9 !important;
}

:deep(.p-datepicker-range) {
  background-color: rgba(0, 187, 249, 0.15) !important;
}

:deep(.p-datepicker-day-selected) {
  background-color: #00bbf9 !important;
  color: white !important;
}

:deep(.p-datepicker-day:hover) {
  background-color: rgba(0, 187, 249, 0.1) !important;
}
</style>