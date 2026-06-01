<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['next'])

const props = defineProps({
  modelValue: Object
})

const travelerCounts = { solo: 1, pareja: 2, familia: 4, grupo: 6 }

const numberOfTravelers = computed(() => {
  const travelers = props.modelValue?.travelers || 'solo'
  return travelerCounts[travelers] || 1
})

const travelerAges = ref(Array(numberOfTravelers.value).fill(null))

watch(numberOfTravelers, (count) => {
  travelerAges.value = Array(count).fill(null)
}, { immediate: true })

const isValid = computed(() => {
  return travelerAges.value.length > 0 && travelerAges.value.every(a => a !== null && a !== '' && Number(a) > 0)
})

function handleContinue() {
  if (isValid.value) {
    emit('next', { travelerAges: travelerAges.value.map(a => Number(a)) })
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div class="bg-white rounded-2xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-slate-800 mb-6 text-center">¿Qué edad tienen los viajeros?</h2>

      <div class="divide-y divide-slate-100">
        <div
          v-for="(age, index) in travelerAges"
          :key="index"
          class="flex justify-between items-center py-4"
        >
          <span class="text-slate-700 font-medium">
            Viajero {{ index + 1 }}
            <span v-if="index === 0" class="text-slate-400 text-sm">(Titular)</span>
          </span>
          <input
            v-model.number="travelerAges[index]"
            type="number"
            min="1"
            max="100"
            placeholder="Edad"
            class="w-24 text-center bg-slate-50 border border-slate-200 rounded-lg p-2 text-base font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      <button
        @click="handleContinue"
        :disabled="!isValid"
        class="w-full mt-6 h-14 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-slate-900 disabled:text-gray-400 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"
      >
        <span>{{ isValid ? 'Continuar' : 'Ingresa la edad de todos' }}</span>
        <svg v-if="isValid" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  </div>
</template>
