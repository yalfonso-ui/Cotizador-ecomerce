<script setup>
import { ref, computed } from 'vue'
import StepButton from '../../ui/StepButton.vue'

const props = defineProps({
  quoteData: {
    type: Object,
    default: () => ({})
  },
  selectedPlan: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit-payment'])

const cardNumber = ref('')
const cardName = ref('')
const expiry = ref('')
const cvv = ref('')

const errors = ref({
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: ''
})

const planPrice = computed(() => {
  return props.selectedPlan?.price || props.quoteData?.selectedPlan?.price || 40
})

const discountAmount = computed(() => {
  if (!props.quoteData?.discountCode) return 0
  return Math.round(planPrice.value * 0.2)
})

const finalPrice = computed(() => {
  return planPrice.value - discountAmount.value
})

const isValid = computed(() => {
  return (
    cardNumber.value.replace(/\s/g, '').length === 16 &&
    cardName.value.trim().length >= 3 &&
    expiry.value.length === 5 &&
    cvv.value.length >= 3
  )
})

function formatCardNumber(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  
  let formatted = ''
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += ' '
    formatted += value[i]
  }
  
  cardNumber.value = formatted
  errors.value.cardNumber = ''
}

function formatExpiry(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  
  if (value.length > 2) {
    expiry.value = value.slice(0, 2) + '/' + value.slice(2)
  } else {
    expiry.value = value
  }
  errors.value.expiry = ''
}

function formatCVV(event) {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  cvv.value = value
  errors.value.cvv = ''
}

function validateAndSubmit() {
  let valid = true
  
  if (cardNumber.value.replace(/\s/g, '').length !== 16) {
    errors.value.cardNumber = 'El número de tarjeta debe tener 16 dígitos'
    valid = false
  }
  
  if (cardName.value.trim().length < 3) {
    errors.value.cardName = 'Ingresa el nombre como aparece en la tarjeta'
    valid = false
  }
  
  if (expiry.value.length !== 5) {
    errors.value.expiry = 'Formato: MM/AA'
    valid = false
  }
  
  if (cvv.value.length < 3) {
    errors.value.cvv = 'Código de seguridad incompleto'
    valid = false
  }
  
  if (valid) {
    emit('submit-payment')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#43D3FF]/20 mb-4">
        <span class="text-3xl">💳</span>
      </div>
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        Datos de tu tarjeta
      </h2>
      <p class="text-gray-500">Pago 100% asistencia y encriptado</p>
    </div>

    <!-- Order Summary with Discount -->
    <div class="bg-gray-50 rounded-xl p-4 mb-6">
      <p class="text-sm font-medium text-gray-500 mb-3">Resumen de tu pedido</p>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Plan {{ selectedPlan?.name || 'Explorer' }}</span>
          <span class="font-medium text-[#00184C]">${{ planPrice }} USD</span>
        </div>
        <div v-if="discountAmount > 0" class="flex justify-between items-center text-green-600">
          <span class="text-sm">Descuento aplicado</span>
          <span class="text-sm font-medium">-${{ discountAmount }} USD</span>
        </div>
        <div class="border-t border-gray-200 pt-2">
          <div class="flex justify-between items-center">
            <span class="font-semibold text-[#00184C]">Total a pagar</span>
            <span class="text-xl font-bold" :class="discountAmount > 0 ? 'text-green-600' : 'text-[#00184C]'">
              ${{ finalPrice }} USD
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-gray-600 mb-2 block">
          Número de tarjeta
        </label>
        <input
          :value="cardNumber"
          @input="formatCardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          maxlength="19"
          class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all font-mono tracking-wider text-center"
          :class="errors.cardNumber ? 'border-red-400' : ''"
        />
        <p v-if="errors.cardNumber" class="text-red-500 text-sm mt-1">{{ errors.cardNumber }}</p>
      </div>

      <div>
        <label class="text-sm font-medium text-gray-600 mb-2 block">
          Nombre en la tarjeta
        </label>
        <input
          v-model="cardName"
          type="text"
          placeholder="Como aparece en la tarjeta"
          class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all uppercase"
          :class="errors.cardName ? 'border-red-400' : ''"
          @input="errors.cardName = ''"
        />
        <p v-if="errors.cardName" class="text-red-500 text-sm mt-1">{{ errors.cardName }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-gray-600 mb-2 block">
            Expiración
          </label>
          <input
            :value="expiry"
            @input="formatExpiry"
            type="text"
            placeholder="MM/AA"
            maxlength="5"
            class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all text-center font-mono"
            :class="errors.expiry ? 'border-red-400' : ''"
          />
          <p v-if="errors.expiry" class="text-red-500 text-sm mt-1">{{ errors.expiry }}</p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-600 mb-2 block">
            CVV
          </label>
          <input
            :value="cvv"
            @input="formatCVV"
            type="text"
            placeholder="123"
            maxlength="4"
            class="w-full h-14 px-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#43D3FF] focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/20 transition-all text-center font-mono"
            :class="errors.cvv ? 'border-red-400' : ''"
          />
          <p v-if="errors.cvv" class="text-red-500 text-sm mt-1">{{ errors.cvv }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 text-sm text-gray-500 pt-2">
      <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Pago asistencia con SSL de 256-bit</span>
    </div>

    <div class="pt-4">
      <StepButton
        :text="`Asegurar mi viaje por $${finalPrice} USD`"
        :disabled="!isValid"
        :loading="false"
        @click="validateAndSubmit"
      />
    </div>
  </div>
</template>