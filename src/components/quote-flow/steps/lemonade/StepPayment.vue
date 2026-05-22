<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['update', 'submit-payment', 'next'])

const props = defineProps({
  quoteData: Object
})

const cardNumber = ref('')
const cardName = ref('')
const expiry = ref('')
const cvv = ref('')

const expiryRef = ref(null)
const cvvRef = ref(null)

const isValid = computed(() => {
  return cardNumber.value.length >= 16 &&
    cardName.value.trim().length >= 3 &&
    expiry.value.length === 5 &&
    cvv.value.length >= 3
})

const formattedPrice = computed(() => {
  if (!props.quoteData?.selectedPlan) return ''
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(props.quoteData.selectedPlan.price)
})

watch(cardNumber, (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 16)
  cardNumber.value = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
})

watch(expiry, (val) => {
  const cleaned = val.replace(/\D/g, '').slice(0, 4)
  if (cleaned.length >= 2) {
    expiry.value = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
  } else {
    expiry.value = cleaned
  }
})

watch(cvv, (val) => {
  cvv.value = val.replace(/\D/g, '').slice(0, 4)
})

function handleSubmit() {
  if (isValid.value) {
    emit('update', 'paymentData', {
      cardNumber: cardNumber.value,
      cardName: cardName.value,
      expiry: expiry.value,
      cvv: cvv.value
    })
    emit('submit-payment')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Order Summary -->
    <div v-if="quoteData?.selectedPlan" class="bg-gray-50 rounded-xl p-4 mb-6">
      <div class="flex justify-between items-center">
        <div>
          <p class="font-semibold text-primary-500">Plan {{ quoteData.selectedPlan.name }}</p>
          <p class="text-sm text-gray-500">Cobertura {{ quoteData.selectedPlan.coverage }}</p>
        </div>
        <span class="text-2xl font-bold text-primary-500">${{ quoteData.selectedPlan.price }}</span>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Número de tarjeta</label>
        <input
          v-model="cardNumber"
          type="text"
          inputmode="numeric"
          placeholder="1234 5678 9012 3456"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Nombre en la tarjeta</label>
        <input
          v-model="cardName"
          type="text"
          placeholder="Como aparece en la tarjeta"
          class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
        />
      </div>
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-600 mb-2">Vencimiento</label>
          <input
            ref="expiryRef"
            v-model="expiry"
            type="text"
            inputmode="numeric"
            placeholder="MM/YY"
            class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-600 mb-2">CVV</label>
          <input
            ref="cvvRef"
            v-model="cvv"
            type="text"
            inputmode="numeric"
            placeholder="123"
            class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-secondary-300 focus:outline-none focus:ring-4 focus:ring-secondary-300/20 transition-all"
          />
        </div>
      </div>
    </div>

    <button
      @click="handleSubmit"
      :disabled="!isValid"
      class="w-full h-14 bg-accent-300 text-primary-500 font-bold text-lg rounded-xl hover:bg-accent-400 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-200 shadow-lg shadow-accent/20"
    >
      Pagar {{ formattedPrice }}
    </button>

    <p class="text-center text-xs text-gray-400">
      🔒 Tus datos están protegidos con encriptación SSL
    </p>
  </div>
</template>