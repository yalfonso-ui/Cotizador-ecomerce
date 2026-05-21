<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const props = defineProps({
  quoteData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update', 'next'])

const discountCode = ref(props.quoteData?.discountCode || '')
const isApplied = ref(!!props.quoteData?.discountCode)
const error = ref('')
const isChecking = ref(false)

const isValid = computed(() => {
  return discountCode.value.trim().length >= 4
})

const planPrice = computed(() => {
  return props.quoteData?.selectedPlan?.price || 40
})

const discountAmount = computed(() => {
  if (!isApplied.value) return 0
  return Math.round(planPrice.value * 0.2)
})

const finalPrice = computed(() => {
  return planPrice.value - discountAmount.value
})

async function applyDiscount() {
  if (!isValid.value) return
  
  isChecking.value = true
  error.value = ''
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (discountCode.value.toUpperCase() === 'DESCUENTO20') {
    isApplied.value = true
    emit('update', 'discountCode', discountCode.value.toUpperCase())
  } else {
    error.value = 'Código no válido. Intenta otro.'
  }
  
  isChecking.value = false
}

function removeDiscount() {
  discountCode.value = ''
  isApplied.value = false
  error.value = ''
  emit('update', 'discountCode', '')
}

function handleNext() {
  emit('next')
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F9D35A]/20 mb-4">
        <span class="text-3xl">🎟️</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        ¿Tienes un código de descuento?
      </h2>
      <p class="text-gray-500">Ingrésalo para aplicar tu descuento</p>
    </div>

    <!-- Order Summary (Context for user) -->
    <div class="bg-gray-50 rounded-xl p-4 mb-2">
      <p class="text-sm font-medium text-gray-500 mb-3">Resumen de tu pedido</p>
      <div class="flex justify-between items-center mb-2">
        <span class="text-gray-600">Plan {{ quoteData?.selectedPlan?.name || 'Explorer' }}</span>
        <span class="font-medium text-[#00184C]">${{ planPrice }} USD</span>
      </div>
      <div v-if="isApplied" class="flex justify-between items-center text-green-600 mb-2">
        <span class="text-sm">Descuento (20%)</span>
        <span class="text-sm font-medium">-${{ discountAmount }} USD</span>
      </div>
      <div class="border-t border-gray-200 pt-2 mt-2">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-[#00184C]">Total</span>
          <span class="text-xl font-bold" :class="isApplied ? 'text-green-600' : 'text-[#00184C]'">
            ${{ isApplied ? finalPrice : planPrice }} USD
          </span>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="relative">
        <input
          v-model="discountCode"
          type="text"
          placeholder="Ej: VIAJERO2024"
          :disabled="isApplied"
          class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all text-center uppercase tracking-wider font-mono"
          :class="[
            error ? 'border-red-400' : '',
            isApplied ? 'bg-green-50 border-green-400 text-green-700' : ''
          ]"
          @input="error = ''"
        />
        
        <div v-if="isApplied" class="absolute right-4 top-1/2 -translate-y-1/2">
          <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
      
      <p v-if="isApplied" class="text-green-600 text-sm text-center font-medium">
        ¡Descuento aplicado! Ahorra ${{ discountAmount }} USD
      </p>
    </div>

    <div class="flex gap-3">
      <button
        v-if="!isApplied"
        @click="applyDiscount"
        :disabled="!isValid || isChecking"
        class="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-gray-100 text-[#00184C] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isChecking ? 'Verificando...' : 'Aplicar código' }}
      </button>
      
      <button
        v-if="isApplied"
        @click="removeDiscount"
        class="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100"
      >
        Eliminar
      </button>
      
      <button
        @click="handleNext"
        class="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 bg-[#F9D35A] text-[#00184C] hover:bg-[#D4A82A]"
      >
        Continuar
      </button>
    </div>

    <p class="text-xs text-gray-400 text-center">
      Usa el código <span class="font-mono bg-gray-100 px-1 rounded">DESCUENTO20</span> para probar el descuento
    </p>
  </div>
</template>