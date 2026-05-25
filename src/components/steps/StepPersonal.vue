<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])

const name = ref('')
const email = ref('')
const phone = ref('')

const nameValid = computed(() => name.value.trim().length >= 3)
const emailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})
const phoneValid = computed(() => {
  const digits = phone.value.replace(/\D/g, '')
  return digits.length >= 10
})

const isValid = computed(() => nameValid.value && emailValid.value && phoneValid.value)

const nameTouched = ref(false)
const emailTouched = ref(false)
const phoneTouched = ref(false)

function handleNext() {
  nameTouched.value = true
  emailTouched.value = true
  phoneTouched.value = true
  
  if (isValid.value) {
    emit('next', { personalData: { name: name.value, email: email.value, phone: phone.value } })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Nombre completo</label>
        <input
          v-model="name"
          type="text"
          placeholder="Ej: María García"
          @blur="nameTouched = true"
          class="w-full h-14 px-4 text-lg bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="nameTouched && !nameValid 
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="nameTouched && !nameValid" class="text-red-500 text-xs mt-1">Mínimo 3 caracteres</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Correo electrónico</label>
        <input
          v-model="email"
          type="email"
          placeholder="Ej: maria@email.com"
          @blur="emailTouched = true"
          class="w-full h-14 px-4 text-lg bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="emailTouched && !emailValid 
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="emailTouched && !emailValid" class="text-red-500 text-xs mt-1">Ingresa un correo válido</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="Ej: +52 55 1234 5678"
          @blur="phoneTouched = true"
          class="w-full h-14 px-4 text-lg bg-white border-2 rounded-xl transition-all duration-200 placeholder:text-gray-300"
          :class="phoneTouched && !phoneValid 
            ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border-gray-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'"
        />
        <p v-if="phoneTouched && !phoneValid" class="text-red-500 text-xs mt-1">Mínimo 10 dígitos</p>
      </div>
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

    <p v-if="!isValid && (nameTouched || emailTouched || phoneTouched)" class="text-center text-gray-400 text-sm">
      Completa todos los campos para continuar
    </p>
  </div>
</template>