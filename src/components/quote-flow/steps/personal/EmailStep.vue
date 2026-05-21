<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['update', 'next'])

const email = ref('')

const error = ref('')

const isValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

function validateAndProceed() {
  if (!email.value.trim()) {
    error.value = 'Por favor ingresa tu email'
    return
  }
  if (!isValid.value) {
    error.value = 'Por favor ingresa un email válido'
    return
  }
  error.value = ''
  emit('update', 'personalData.email', email.value.trim().toLowerCase())
  emit('next')
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">✉️</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Cuál es tu email?
      </h2>
      <p class="text-gray-500">Te we'll enviar los detalles de tu póliza</p>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-600 mb-2 block">
          Correo electrónico
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="Ej: maria@email.com"
          class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all"
          :class="error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''"
          @keyup.enter="validateAndProceed"
          @input="error = ''"
        />
        <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center">
      Tu información está protegida y nunca compartiremos tus datos.
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