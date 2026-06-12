<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['payment-success', 'error'])

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

const isFormValid = computed(() => cardNumber.value.length > 5 && cardName.value.length > 2 && expiryDate.value.length >= 4 && cvv.value.length >= 3)

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
    emit('payment-success', {
      cardLast4: cardNumber.value.replace(/\s/g, '').slice(-4),
      amount: props.amount
    })
  }, 1500)
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-gradient-to-r from-[#00184C] to-[#0B1A3D] rounded-2xl p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center">
            <span class="text-2xl">🛡️</span>
          </div>
          <div>
            <p class="text-xs text-cyan-400 uppercase tracking-wide mb-1">Plan elegido</p>
            <p class="text-white font-bold text-lg">{{ planName || 'Explorer' }}</p>
            <p class="text-gray-400 text-sm">
              Cobertura 
              {{ planName === 'Essential' ? '$15,000' : planName === 'Explorer' ? '$50,000' : planName === 'Premium' ? '$100,000' : '$50,000' }} USD
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-3xl font-bold text-yellow-400">${{ amount || 40 }}</p>
          <p class="text-gray-400 text-sm">USD</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-900 mb-2">Número de tarjeta</label>
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
          <label class="block text-sm font-medium text-slate-900 mb-2">Nombre en la tarjeta</label>
          <input
            v-model="cardName"
            type="text"
            placeholder="Como aparece en tu tarjeta"
            class="w-full h-14 px-4 text-lg bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-300"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-900 mb-2">Fecha de vencimiento</label>
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
            <label class="block text-sm font-medium text-slate-900 mb-2">Código de seguridad</label>
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
      <span>🔒</span>
      <span>Pago 100% asistencia. Datos encriptados de extremo a extremo.</span>
    </div>

    <div class="flex items-center justify-center gap-4 py-3">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6 opacity-60" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" class="h-8 opacity-60" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/120px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-5 opacity-60" />
    </div>

    <button
      @click="handleSubmit"
      :disabled="!isFormValid || isProcessing"
      class="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <svg v-if="isProcessing" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="isProcessing">Procesando pago...</span>
      <span v-else>Confirmar Pago - ${{ amount || 40 }} USD</span>
    </button>
  </div>
</template>