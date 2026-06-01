<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['update', 'next', 'prev'])

const dateRange = ref([])
const minDate = new Date()

const startDate = computed(() => dateRange.value[0] || null)
const endDate = computed(() => dateRange.value[1] || null)

const isValid = computed(() => startDate.value && endDate.value)

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
    emit('update', 'dates', { start: startDate.value, end: endDate.value })
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-900 mb-6">¿Cuándo viajas?</h2>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        class="bg-slate-50 rounded-xl p-4 transition-all duration-200 border-2"
        :class="!startDate ? 'border-cyan-400' : 'border-transparent'"
      >
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Salida</p>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-bold" :class="startDate ? 'text-slate-800' : 'text-slate-400'">
            {{ startDate ? formatDisplayDate(startDate) : 'Seleccionar' }}
          </span>
        </div>
      </div>

      <div
        class="bg-slate-50 rounded-xl p-4 transition-all duration-200 border-2"
        :class="startDate && !endDate ? 'border-cyan-400' : 'border-transparent'"
      >
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Regreso</p>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm font-bold" :class="endDate ? 'text-slate-800' : 'text-slate-400'">
            {{ endDate ? formatDisplayDate(endDate) : 'Seleccionar' }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <DatePicker
        v-model="dateRange"
        selectionMode="range"
        :inline="true"
        :manualInput="false"
        :minDate="minDate"
        :showWeek="false"
        class="w-full"
        inputClass="hidden"
        panelClass="rounded-xl shadow-xl border-0"
        dateFormat="dd/mm/yy"
        :showIcon="false"
      />
    </div>

    <div v-if="isValid" class="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
      <span class="text-sm text-slate-500">Duración del viaje</span>
      <span class="text-lg font-bold text-slate-800">{{ tripDays }} días</span>
    </div>

    <div class="space-y-4 pt-2">
      <button
        @click="handleContinue"
        :disabled="!isValid"
        class="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
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
    </div>

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

:deep(.p-datepicker-calendar td > span {
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

:deep(.p-datepicker-day):hover {
  background-color: rgba(0, 187, 249, 0.1) !important;
}
</style>