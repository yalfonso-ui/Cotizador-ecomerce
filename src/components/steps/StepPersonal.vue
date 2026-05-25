<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['next'])

const props = defineProps({
  selectedPlan: {
    type: Object,
    default: null
  }
})

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

const planNames = { essential: 'Essential', explorer: 'Explorer', premium: 'Premium' }
const planPrices = { essential: 25, explorer: 40, premium: 65 }

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
    <!-- Mini plan summary - genera confianza mostrando lo que eligió -->
    <div v-if="selectedPlan" class="bg-gradient-to-r from-[#00184C] to-[#0B1A3D] rounded-xl p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center">
          <span class="text-lg">🛡️</span>
        </div>
        <div>
          <p class="text-xs text-cyan-400 uppercase tracking-wide">Plan seleccionado</p>
          <p class="text-white font-semibold">{{ planNames[selectedPlan] || selectedPlan }}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-yellow-400">${{ planPrices[selectedPlan] || '?' }}</p>
        <p class="text-xs text-gray-400">USD</p>
      </div>
    </div>

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
      class="w-full h-14 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
      :class="isValid
        ? 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/30 text-gray-900'
        : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
    >
      <template v-if="isValid">
        <span>Continuar al pago</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
      <template v-else>
        <span>Completa tus datos</span>
      </template>
    </button>

    <p v-if="!isValid && (nameTouched || emailTouched || phoneTouched)" class="text-center text-gray-400 text-sm">
      Completa todos los campos para continuar
    </p>
  </div>
</template>