<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update', 'next'])

const props = defineProps({
  modelValue: String
})

const selectedId = ref(props.modelValue || '')
const showBirthdates = ref(false)

const options = [
  { id: 'solo', label: 'Solo', sublabel: '1 persona', icon: '🧑', price: 'Desde $25', count: 1 },
  { id: 'pareja', label: 'Pareja', sublabel: '2 personas', icon: '👫', price: 'Desde $40', count: 2 },
  { id: 'familia', label: 'Familia', sublabel: '3-5 personas', icon: '👨‍👩‍👧‍👦', price: 'Desde $55', count: 5 },
  { id: 'grupo', label: 'Grupo', sublabel: '6+ personas', icon: '👥', price: 'Desde $70', count: 6 }
]

const travelers = ref([])
const travelerLabels = ['Viajero 1 (Titular)', 'Viajero 2', 'Viajero 3', 'Viajero 4', 'Viajero 5', 'Viajero 6+']

watch(selectedId, (val) => {
  const option = options.find(o => o.id === val)
  if (option) {
    travelers.value = Array(option.count).fill(null).map(() => ({
      day: '',
      month: '',
      year: ''
    }))
  }
})

function select(option) {
  selectedId.value = option.id
  emit('update', option.id)
  
  if (option.id === 'solo') {
    setTimeout(() => {
      emit('next', { travelers: option.id, birthdates: [null] })
    }, 300)
  } else {
    showBirthdates.value = true
  }
}

const allBirthdatesFilled = computed(() => {
  return travelers.value.every(t => {
    const d = parseInt(t.day)
    const m = parseInt(t.month)
    const y = parseInt(t.year)
    return !isNaN(d) && !isNaN(m) && !isNaN(y) && d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900 && y <= new Date().getFullYear()
  })
})

const isValid = computed(() => {
  if (!selectedId.value) return false
  if (selectedId.value === 'solo') return true
  return allBirthdatesFilled.value
})

function handleContinue() {
  if (isValid.value) {
    const birthdates = travelers.value.map(t => ({
      day: t.day,
      month: t.month,
      year: t.year
    }))
    emit('next', { travelers: selectedId.value, birthdates })
  }
}

function formatTravelerLabel(index) {
  return travelerLabels[index] || `Viajero ${index + 1}`
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="!showBirthdates" class="grid grid-cols-2 gap-4">
      <button
        v-for="option in options"
        :key="option.id"
        @click="select(option)"
        class="relative p-6 rounded-2xl border-2 bg-white transition-all duration-200 text-center"
        :class="selectedId === option.id
          ? 'border-cyan-500 ring-4 ring-cyan-500 bg-cyan-50 shadow-lg'
          : 'border-gray-100 hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500'"
      >
        <div v-if="selectedId === option.id" class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span class="text-5xl mb-3 block">{{ option.icon }}</span>
        <h3 class="font-semibold text-lg mb-1" :class="selectedId === option.id ? 'text-cyan-700' : 'text-slate-900'">
          {{ option.label }}
        </h3>
        <p class="text-sm mb-3" :class="selectedId === option.id ? 'text-cyan-600' : 'text-gray-500'">
          {{ option.sublabel }}
        </p>
        <span class="text-sm font-medium" :class="selectedId === option.id ? 'text-cyan-600' : 'text-slate-900'">
          {{ option.price }}
        </span>
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="showBirthdates = false; selectedId = ''" class="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Cambiar tipo de viaje
        </button>
        <span class="text-sm text-cyan-600 font-medium">{{ travelers.length }} viajeros</span>
      </div>

      <div v-for="(traveler, index) in travelers" :key="index" class="bg-slate-50 rounded-xl p-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{{ formatTravelerLabel(index) }}</p>
        <div class="flex gap-3">
          <div class="flex-1">
            <label class="block text-xs text-slate-500 mb-1">Día</label>
            <input
              v-model="traveler.day"
              type="text"
              inputmode="numeric"
              maxlength="2"
              placeholder="DD"
              class="w-full h-12 px-3 text-center bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-slate-500 mb-1">Mes</label>
            <input
              v-model="traveler.month"
              type="text"
              inputmode="numeric"
              maxlength="2"
              placeholder="MM"
              class="w-full h-12 px-3 text-center bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>
          <div class="flex-1">
            <label class="block text-xs text-slate-500 mb-1">Año</label>
            <input
              v-model="traveler.year"
              type="text"
              inputmode="numeric"
              maxlength="4"
              placeholder="AAAA"
              class="w-full h-12 px-3 text-center bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <button
        @click="handleContinue"
        :disabled="!isValid"
        class="w-full h-14 font-bold rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
        :class="isValid
          ? 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/30 text-slate-900'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
      >
        <span>{{ isValid ? 'Continuar' : 'Completa las fechas de nacimiento' }}</span>
        <svg v-if="isValid" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  </div>
</template>