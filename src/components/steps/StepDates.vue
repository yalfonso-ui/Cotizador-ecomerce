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
  }
})

function handleNext() {
  if (isValid.value) {
    const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : null
    emit('next', {
      dates: {
        start: formatDate(startDate.value),
        end: formatDate(endDate.value)
      }
    })
  }
}

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
    <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
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

    <button
      @click="handleNext"
      :disabled="!isValid"
      class="w-full h-14 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg"
      :class="isValid
        ? 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/20 text-gray-900'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200'"
    >
      Continuar
    </button>
  </div>
</template>