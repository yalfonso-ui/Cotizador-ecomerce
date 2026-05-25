<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const emit = defineEmits(['next'])

const day = ref('')
const month = ref('')
const year = ref('')

const dayTouched = ref(false)
const monthTouched = ref(false)
const yearTouched = ref(false)

const dayRef = ref(null)
const monthRef = ref(null)
const yearRef = ref(null)

watch(day, (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 2)
  day.value = clean
  if (clean.length === 2) {
    nextTick(() => monthRef.value?.focus())
  }
})

watch(month, (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 2)
  month.value = clean
  if (clean.length === 2) {
    nextTick(() => yearRef.value?.focus())
  }
})

watch(year, (val) => {
  year.value = val.replace(/\D/g, '').slice(0, 4)
})

const dayError = computed(() => {
  if (!dayTouched.value || !day.value) return ''
  const d = parseInt(day.value)
  if (isNaN(d) || d < 1 || d > 31) return 'Día inválido'
  return ''
})

const monthError = computed(() => {
  if (!monthTouched.value || !month.value) return ''
  const m = parseInt(month.value)
  if (isNaN(m) || m < 1 || m > 12) return 'Mes inválido'
  return ''
})

const yearError = computed(() => {
  if (!yearTouched.value || !year.value) return ''
  let y = parseInt(year.value)
  if (year.value.length < 4) return 'Ingresa 4 dígitos'
  if (isNaN(y)) return 'Año inválido'
  if (y < 1900 || y > new Date().getFullYear()) return 'Año fuera de rango'
  return ''
})

const isValid = computed(() => {
  if (!day.value || !month.value || !year.value) return false
  const d = parseInt(day.value)
  const m = parseInt(month.value)
  let y = parseInt(year.value)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false
  if (d < 1 || d > 31) return false
  if (m < 1 || m > 12) return false
  const currentYear = new Date().getFullYear()
  if (y < 1900 || y > currentYear) return false
  return true
})

function handleNext() {
  dayTouched.value = true
  monthTouched.value = true
  yearTouched.value = true
  if (isValid.value) {
    emit('next', { birthdate: { day: day.value, month: month.value, year: year.value } })
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
          @blur="dayTouched = true"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="dayError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="dayError" class="text-red-500 text-xs mt-1">{{ dayError }}</p>
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
          @blur="monthTouched = true"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="monthError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="monthError" class="text-red-500 text-xs mt-1">{{ monthError }}</p>
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
          @blur="yearTouched = true"
          class="w-full h-14 px-4 text-lg text-center bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="yearError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="yearError" class="text-red-500 text-xs mt-1">{{ yearError }}</p>
      </div>
    </div>

    <!-- Progress indicator -->
    <div class="flex items-center justify-center gap-1 mb-4">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
        :class="day.value ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-400'">
        <span v-if="!day.value">1</span>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="w-8 h-0.5" :class="month.value ? 'bg-cyan-500' : 'bg-gray-200'"></div>
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
        :class="month.value ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-400'">
        <span v-if="!month.value">2</span>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="w-8 h-0.5" :class="year.value ? 'bg-cyan-500' : 'bg-gray-200'"></div>
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
        :class="year.value ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-400'">
        <span v-if="!year.value">3</span>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <!-- CTA Button - Ahora visible y con feedback -->
    <button
      @click="handleNext"
      :disabled="!isValid"
      class="w-full h-14 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
      :class="isValid
        ? 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/30 text-gray-900'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
    >
      <template v-if="isValid">
        <span>Continuar</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
      <template v-else>
        <span>Ingresa tu fecha de nacimiento</span>
      </template>
    </button>
  </div>
</template>