<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update', 'next'])

const startDate = ref('')
const endDate = ref('')
const today = new Date().toISOString().split('T')[0]

const minDate = computed(() => today)

const isValid = computed(() => startDate.value && endDate.value && startDate.value <= endDate.value)

function handleContinue() {
  if (isValid.value) {
    emit('update', 'dates', { start: startDate.value, end: endDate.value })
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Date Inputs -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Fecha de ida</label>
        <input
          v-model="startDate"
          type="date"
          :min="minDate"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-[#00184C] focus:outline-none focus:ring-4 focus:ring-[#00184C]/10 transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Fecha de regreso</label>
        <input
          v-model="endDate"
          type="date"
          :min="startDate || minDate"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-[#00184C] focus:outline-none focus:ring-4 focus:ring-[#00184C]/10 transition-all"
        />
      </div>
    </div>

    <!-- Continue Button -->
    <button
      @click="handleContinue"
      :disabled="!isValid"
      class="w-full h-14 bg-[#00184C] text-white font-semibold text-lg rounded-xl hover:bg-[#00133D] disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-[#00184C]/20"
    >
      Continuar
    </button>
  </div>
</template>