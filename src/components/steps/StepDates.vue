<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['next'])

const dateRange = ref(null)
const startTouched = ref(false)
const endTouched = ref(false)

const minDate = new Date()

const startDate = computed(() => dateRange.value?.[0] || null)
const endDate = computed(() => dateRange.value?.[1] || null)

const startValid = computed(() => !!startDate.value)
const endValid = computed(() => {
  if (!endDate.value) return false
  if (!startDate.value) return false
  return endDate.value >= startDate.value
})

const endError = computed(() => {
  if (!endTouched.value || !endDate.value) return ''
  if (!startDate.value) return 'Primero selecciona fecha de ida'
  if (endDate.value < startDate.value) return 'La fecha regreso debe ser posterior'
  return ''
})

const isValid = computed(() => startValid.value && endValid.value)

watch(dateRange, (val) => {
  if (val && val[0] && val[1]) {
    startTouched.value = true
    endTouched.value = true
    setTimeout(() => {
      const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : null
      emit('next', {
        dates: {
          start: formatDate(startDate.value),
          end: formatDate(endDate.value)
        }
      })
    }, 300)
  }
})

function getTripDuration() {
  if (!startDate.value || !endDate.value) return ''
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diff === 1 ? '1 día' : `${diff} días`
}

function formatDisplayDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-100">
      <DatePicker
        v-model="dateRange"
        selectionMode="range"
        :minDate="minDate"
        :manualInput="false"
        showWeek
        class="w-full"
        inputClass="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all"
        panelClass="rounded-xl shadow-xl border border-gray-100"
        dateFormat="dd/mm/yy"
        placeholder="Selecciona tus fechas de viaje"
        :showIcon="true"
        :showButtonBar="true"
        todayButtonProps="bg-cyan-500 hover:bg-cyan-600 border-none"
        clearButtonProps="text-gray-400 hover:text-gray-600"
      />
    </div>

    <div v-if="startDate && endDate" class="text-center p-4 bg-cyan-50 rounded-xl border border-cyan-100">
      <p class="text-cyan-700 font-medium">{{ formatDisplayDate(startDate) }}</p>
      <p class="text-cyan-500 text-sm">→</p>
      <p class="text-cyan-700 font-medium">{{ formatDisplayDate(endDate) }}</p>
      <p class="text-cyan-600 text-sm mt-1 font-medium">{{ getTripDuration() }}</p>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-datepicker) {
  --p-datepicker-range-start-background-color: #06b6d4;
  --p-datepicker-range-end-background-color: #06b6d4;
}

:deep(.p-datepicker-range-start),
:deep(.p-datepicker-range-end) {
  background-color: #06b6d4 !important;
  border-color: #06b6d4 !important;
}

:deep(.p-highlight) {
  background-color: #06b6d4 !important;
  border-color: #06b6d4 !important;
}

:deep(.p-datepicker-range) {
  background-color: rgba(6, 182, 212, 0.2) !important;
}

:deep(.p-datepicker-day-pivot) {
  background-color: #06b6d4 !important;
  color: white !important;
}

:deep(.p-datepicker-today) {
  border-color: #06b6d4 !important;
}

:deep(.p-datepicker-day-selected) {
  background-color: #06b6d4 !important;
  color: white !important;
}

:deep(.p-datepicker-day-in-range) {
  background-color: rgba(6, 182, 212, 0.15) !important;
  color: #0f172a !important;
}

:deep(.p-datepicker-day-in-selectable-range) {
  color: #0f172a !important;
}

:deep(.p-datepicker-day-in-selectable-range:hover) {
  background-color: rgba(6, 182, 212, 0.2) !important;
}

:deep(.p-button.p-datepicker-today-button) {
  background-color: #06b6d4 !important;
  border-color: #06b6d4 !important;
  color: white !important;
}

:deep(.p-button.p-datepicker-today-button:hover) {
  background-color: #0891b2 !important;
}

:deep(.p-datepicker-close-button) {
  color: #0f172a !important;
}

:deep(.p-datepicker-close-button:hover) {
  color: #06b6d4 !important;
}
</style>