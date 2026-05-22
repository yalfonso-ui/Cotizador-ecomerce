<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update', 'next'])

const day = ref('')
const month = ref('')
const year = ref('')

const dayRef = ref(null)
const monthRef = ref(null)
const yearRef = ref(null)

const isValid = computed(() => {
  const d = parseInt(day.value)
  const m = parseInt(month.value)
  const y = parseInt(year.value)
  return d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= new Date().getFullYear() - 18
})

watch(day, (val) => {
  if (val.length === 2) monthRef.value?.focus()
})

watch(month, (val) => {
  if (val.length === 2) yearRef.value?.focus()
})

function handleContinue() {
  if (isValid.value) {
    emit('update', 'birthdate', { day: day.value, month: month.value, year: year.value })
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex gap-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-2">Día</label>
        <input
          ref="dayRef"
          v-model="day"
          type="text"
          inputmode="numeric"
          maxlength="2"
          placeholder="DD"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-2">Mes</label>
        <input
          ref="monthRef"
          v-model="month"
          type="text"
          inputmode="numeric"
          maxlength="2"
          placeholder="MM"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-2">Año</label>
        <input
          ref="yearRef"
          v-model="year"
          type="text"
          inputmode="numeric"
          maxlength="4"
          placeholder="AAAA"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
    </div>

    <button
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full h-14 bg-accent-300 text-primary-500 font-semibold text-lg rounded-xl hover:bg-accent-400 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-accent/20"
    >
      Continuar
    </button>
  </div>
</template>