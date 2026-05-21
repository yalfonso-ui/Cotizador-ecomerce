<script setup>
import { ref, computed } from 'vue'
import DateInputs from '../../ui/DateInputs.vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const birthdate = ref({ day: '', month: '', year: '' })

const error = ref('')

const isValid = computed(() => {
  const { day, month, year } = birthdate.value
  if (!day || !month || !year) return false
  
  const d = parseInt(day)
  const m = parseInt(month)
  const y = parseInt(year)
  
  if (isNaN(d) || isNaN(m) || isNaN(y)) return false
  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  
  // Allow any year from 1920 to current year minus 18
  const currentYear = new Date().getFullYear()
  const minYear = 1920
  const maxYear = currentYear - 18
  
  if (y < minYear || y > maxYear) return false
  
  return true
})

function validateAndProceed() {
  const { day, month, year } = birthdate.value
  
  if (!day || !month || !year) {
    error.value = 'Por favor completa todos los campos'
    return
  }
  
  const d = parseInt(day)
  const m = parseInt(month)
  const y = parseInt(year)
  
  if (isNaN(d) || isNaN(m) || isNaN(y)) {
    error.value = 'Por favor completa todos los campos'
    return
  }
  
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    error.value = 'Fecha inválida'
    return
  }
  
  const currentYear = new Date().getFullYear()
  const minYear = 1920
  const maxYear = currentYear - 18
  
  if (y < minYear || y > maxYear) {
    error.value = 'Debes ser mayor de 18 años para contratar'
    return
  }
  
  error.value = ''
  emit('update', 'personalData.birthdate', birthdate.value)
  emit('next')
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">🎂</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Cuándo naciste?
      </h2>
      <p class="text-gray-500">Necesitamos tu fecha de nacimiento para el seguro</p>
    </div>

    <div class="space-y-4">
      <DateInputs 
        v-model="birthdate" 
        :error="error"
        @update:modelValue="error = ''"
      />
    </div>

    <p class="text-xs text-gray-400 text-center">
      Esta información se usa únicamente para calcular tu cobertura.
    </p>

    <div class="pt-4">
      <StepButton
        text="Continuar"
        :disabled="!isValid"
        @click="validateAndProceed"
      />
    </div>
  </div>
</template>