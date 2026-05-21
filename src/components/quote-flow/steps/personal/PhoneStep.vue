<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const phone = ref('')

const error = ref('')

const isValid = computed(() => {
  const cleaned = phone.value.replace(/\D/g, '')
  return cleaned.length >= 7
})

function formatPhone(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 10) value = value.slice(0, 10)
  
  if (value.length > 0) {
    value = '(' + value
  }
  if (value.length > 3) {
    value = value.slice(0, 3) + ') ' + value.slice(3)
  }
  if (value.length > 9) {
    value = value.slice(0, 9) + '-' + value.slice(9)
  }
  
  phone.value = value
}

function handleInput(event) {
  formatPhone(event)
  error.value = ''
}

function validateAndProceed() {
  const cleaned = phone.value.replace(/\D/g, '')
  if (!cleaned) {
    error.value = 'Por favor ingresa tu número de teléfono'
    return
  }
  if (cleaned.length < 7) {
    error.value = 'El número debe tener al menos 7 dígitos'
    return
  }
  error.value = ''
  emit('update', 'personalData.phone', cleaned)
  emit('next')
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">📱</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Cuál es tu número de teléfono?
      </h2>
      <p class="text-gray-500">Para recibir alertas y confirmaciones</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-600 mb-2 block">
          Teléfono móvil (10 dígitos)
        </label>
        <input
          :value="phone"
          @input="handleInput"
          type="tel"
          placeholder="(55) 1234-5678"
          class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all text-center text-xl"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''"
          @keyup.enter="validateAndProceed"
        />
        <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center">
      No compartimos tu número con terceros.
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