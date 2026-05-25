<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['success', 'error'])

const props = defineProps({
  amount: {
    type: Number,
    default: 0
  },
  planName: {
    type: String,
    default: ''
  }
})

const isProcessing = ref(false)
const cardNumber = ref('')
const cardName = ref('')
const expiryDate = ref('')
const cvv = ref('')

const cardNumberValid = computed(() => cardNumber.value.replace(/\s/g, '').length >= 16)
const cardNameValid = computed(() => cardName.value.trim().length >= 3)
const expiryValid = computed(() => {
  const parts = expiryDate.value.split('/')
  if (parts.length !== 2) return false
  const month = parseInt(parts[0])
  const year = parseInt('20' + parts[1])
  if (month < 1 || month > 12) return false
  if (year < new Date().getFullYear()) return false
  return true
})
const cvvValid = computed(() => cvv.value.length >= 3)

const isFormValid = computed(() => cardNumberValid.value && cardNameValid.value && expiryValid.value && cvvValid.value)

function formatCardNumber(e) {
  let value = e.target.value.replace(/\D/g, '')
  value = value.slice(0, 16)
  let formatted = value.match(/.{1,4}/g)?.join(' ') || value
  cardNumber.value = formatted
}

function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4)
  }
  expiryDate.value = value
}

function handleSubmit() {
  if (!isFormValid.value) return
  
  isProcessing.value = true
  
  setTimeout(() => {
    isProcessing.value = false
    emit('success', {
      cardLast4: cardNumber.value.replace(/\s/g, '').slice(-4),
      amount: props.amount
    })
  }, 1500)
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
        <span class="text-3xl">🔒</span>
      </div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Completa tu pago</h2>
      <p class="text-gray-500">Total a pagar: <span class="font-bold text-cyan-600">${{ amount }} USD</span></p>
      <p v-if="planName" class="text-sm text-gray-400 mt-1">Plan {{ planName }}</p>
    </div>

    <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Número de tarjeta</label>
          <div class="relative">
            <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <input
              v-model="cardNumber"
              @input="formatCardNumber"
              type="text"
              inputmode="numeric"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class="w-full h-14 pl-12 pr-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Nombre en la tarjeta</label>
          <input
            v-model="cardName"
            type="text"
            placeholder="Como aparece en tu tarjeta"
            class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Fecha de vencimiento</label>
            <input
              v-model="expiryDate"
              @input="formatExpiry"
              type="text"
              inputmode="numeric"
              placeholder="MM/AA"
              maxlength="5"
              class="w-full h-14 px-4 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-400"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">Código de seguridad</label>
            <div class="relative">
              <input
                v-model="cvv"
                type="text"
                inputmode="numeric"
                placeholder="CVV"
                maxlength="4"
                class="w-full h-14 px-4 pr-12 text-lg text-center bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-400"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
      <span class="text-lg">🔒</span>
      <span>Tus datos están protegidos y encriptados de extremo a extremo</span>
    </div>

    <div class="flex items-center justify-center gap-4 py-3">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6 opacity-60" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" class="h-8 opacity-60" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/120px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-5 opacity-60" />
    </div>

    <button
      @click="handleSubmit"
      :disabled="!isFormValid || isProcessing"
      class="w-full h-16 font-bold text-xl rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
      :class="isProcessing
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
        : isFormValid
          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/30'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
    >
      <template v-if="isProcessing">
        <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Procesando...
      </template>
      <template v-else>
        Confirmar Pago
        <svg v-if="isFormValid" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </template>
    </button>
  </div>
</template>