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
    <div class="max-w-xl mx-auto space-y-6">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div class="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
            <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Edades de los viajeros</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="(age, index) in travelerAges"
            :key="index"
            class="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl"
          >
            <span class="text-sm font-medium text-slate-700">
              Viajero {{ index + 1 }}
              <span v-if="index === 0" class="text-slate-400 text-xs ml-1">(Titular)</span>
            </span>
            <input
              v-model.number="travelerAges[index]"
              type="number"
              min="1"
              max="100"
              placeholder="Edad"
              class="w-20 text-center bg-white border rounded-lg p-2 text-base font-medium text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none"
              :class="[age !== null && age !== '' && Number(age) > 0 ? 'border-green-300 bg-green-50/30' : 'border-slate-200']"
            />
          </div>
        </div>
      </div>

      <button
        @click="handleContinue"
        :disabled="!isValid"
        class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 transition-all shadow-sm mx-auto block disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>{{ isValid ? 'Continuar' : 'Ingresa la edad de todos' }}</span>
        <svg v-if="isValid" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
</template>
