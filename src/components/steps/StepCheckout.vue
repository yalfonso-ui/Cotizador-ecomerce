<script setup>
import { ref, computed } from 'vue'
import DiscountCodeField from '@/components/ui/DiscountCodeField.vue'

const emit = defineEmits(['payment-success', 'go-to-step'])

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const travelersLabels = { solo: '1 viajero', pareja: '2 viajeros', familia: '4 viajeros', grupo: '6+ viajeros' }
const planNames = { essential: 'Essential', explorer: 'Explorer', premium: 'Premium' }
const planPrices = { essential: 25, explorer: 40, premium: 65 }
const planCoverages = { essential: '10,000', explorer: '25,000', premium: '50,000' }

function getPlanPrice() {
  return planPrices[props.data?.selectedPlan] || 0
}

function getPlanName() {
  return planNames[props.data?.selectedPlan] || 'Sin plan'
}

function formatDestination(dest) {
  if (Array.isArray(dest)) return dest.map(d => d?.name || d).join(', ')
  if (typeof dest === 'object' && dest?.name) return dest.name
  return dest || 'No especificado'
}

function formatDate(date) {
  if (!date) return '—'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
}

const isProcessing = ref(false)
const appliedDiscount = ref(null)
const discountError = ref('')

const cardNumber = ref('')
const cardName = ref('')
const expiryDate = ref('')
const cvv = ref('')

const cardNumberTouched = ref(false)
const cardNameTouched = ref(false)
const expiryTouched = ref(false)
const cvvTouched = ref(false)

const cardNumberValid = computed(() => cardNumber.value.replace(/\s/g, '').length >= 13)
const cardNameValid = computed(() => cardName.value.length > 2)
const expiryValid = computed(() => expiryDate.value.length >= 4)
const cvvValid = computed(() => cvv.value.length >= 3)

const isFormValid = computed(() => cardNumberValid.value && cardNameValid.value && expiryValid.value && cvvValid.value)

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  return (getPlanPrice() * appliedDiscount.value.discountPercent) / 100
})

const finalPrice = computed(() => {
  return Math.max(0, getPlanPrice() - discountAmount.value)
})

function formatCardNumber(e) {
  let value = e.target.value.replace(/\D/g, '')
  value = value.slice(0, 16)
  cardNumber.value = value.match(/.{1,4}/g)?.join(' ') || value
}

function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4)
  expiryDate.value = value
}

function handleApplyDiscount(discount) {
  if (discount.error) {
    discountError.value = discount.error
    appliedDiscount.value = null
    setTimeout(() => { discountError.value = '' }, 3000)
  } else {
    appliedDiscount.value = discount
    discountError.value = ''
  }
}

function handleRemoveDiscount() {
  appliedDiscount.value = null
  discountError.value = ''
}

function handleSaveQuote() {
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium animate-fade-in'
  toast.textContent = '¡Cotización guardada! Te enviaremos un recordatorio.'
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

function handleSubmit() {
  if (!isFormValid.value || isProcessing.value) return
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    emit('payment-success', {
      cardLast4: cardNumber.value.replace(/\s/g, '').slice(-4),
      amount: finalPrice.value,
      discount: appliedDiscount.value
    })
  }, 1500)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

      <aside class="lg:col-span-2 lg:order-2 lg:sticky lg:top-4 lg:self-start space-y-3">
        <div v-if="data?.selectedPlan" class="bg-gradient-to-r from-[#00184C] to-[#0B1A3D] rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              
              <div class="min-w-0">
                <p class="text-[10px] text-cyan-400 uppercase tracking-wider mb-0.5">Plan</p>
                <p class="text-white font-bold text-base truncate">{{ getPlanName() }}</p>
                <p class="text-gray-400 text-xs">Cobertura {{ planCoverages[data.selectedPlan] }} USD</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-2xl font-bold text-yellow-400">${{ getPlanPrice() }}</p>
              <p class="text-gray-400 text-[10px]">USD</p>
            </div>
          </div>
          <div v-if="appliedDiscount" class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span class="text-[11px] text-emerald-300 font-medium">Ahorras con {{ appliedDiscount.code }}</span>
            <span class="text-sm font-bold text-emerald-300">-${{ discountAmount.toFixed(2) }} USD</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Ruta</p>
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ data?.origin?.name || data?.origin || 'Origen' }}
                <span class="text-slate-400 mx-1">→</span>
                {{ formatDestination(data?.destination) }}
              </p>
            </div>
            <button
              @click="$emit('go-to-step', 0)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 active:bg-cyan-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar ruta"
            >
              Editar
            </button>
          </div>

          <div class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Fechas</p>
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ formatDate(data?.dates?.start) }} — {{ formatDate(data?.dates?.end) }}
              </p>
            </div>
            <button
              @click="$emit('go-to-step', 2)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 active:bg-cyan-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar fechas"
            >
              Editar
            </button>
          </div>

          <div class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Viajeros</p>
              <p class="font-semibold text-slate-800 text-sm">{{ travelersLabels[data?.travelers] || data?.travelers || '—' }}</p>
            </div>
            <button
              @click="$emit('go-to-step', 3)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 active:bg-cyan-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar viajeros"
            >
              Editar
            </button>
          </div>

          <div class="p-4">
            <div class="flex items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Contacto de emergencia</p>
                <p class="font-semibold text-slate-800 text-sm truncate">{{ data?.emergencyContact?.name || data?.personalData?.name || '—' }}</p>
                <p v-if="data?.emergencyContact?.phone || data?.personalData?.phone" class="text-xs text-slate-500">
                  {{ data?.emergencyContact?.phone || data?.personalData?.phone }}
                </p>
              </div>
              <button
                @click="$emit('go-to-step', 6)"
                class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 active:bg-cyan-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                aria-label="Editar contacto de emergencia"
              >
                Editar
              </button>
            </div>
            <p class="text-[11px] text-slate-500 mt-3 leading-snug">
              Estos datos son confidenciales. Solo nos comunicaremos con tu contacto en caso de una emergencia médica real durante el viaje.
            </p>
          </div>
        </div>
      </aside>

      <section class="lg:col-span-3 lg:order-1 space-y-4">
        <DiscountCodeField
          :modelValue="appliedDiscount"
          @apply="handleApplyDiscount"
          @remove="handleRemoveDiscount"
        />

        <Transition name="fade">
          <p v-if="discountError" class="text-red-600 text-xs flex items-center gap-1 px-1" role="alert">
            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            {{ discountError }}
          </p>
        </Transition>

        <div v-if="appliedDiscount" class="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600">Subtotal</span>
            <span class="font-semibold text-slate-700">${{ getPlanPrice() }}.00 USD</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-emerald-600 font-medium">Descuento ({{ appliedDiscount.discountPercent }}%)</span>
            <span class="font-semibold text-emerald-600">-${{ discountAmount.toFixed(2) }} USD</span>
          </div>
          <div class="h-px bg-slate-200"></div>
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-slate-800">Total a pagar</span>
            <span class="text-xl font-black text-cyan-600">${{ finalPrice.toFixed(2) }} <span class="text-xs text-slate-500 font-medium">USD</span></span>
          </div>
        </div>

        <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
          <div class="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tarjeta de Crédito o Débito</h3>
          </div>

          <div class="space-y-4">
            <div>
              <label for="card-number" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Número de tarjeta
              </label>
              <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <input
                  id="card-number"
                  v-model="cardNumber"
                  @input="formatCardNumber"
                  @blur="cardNumberTouched = true"
                  type="text"
                  inputmode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  autocomplete="cc-number"
                  :aria-invalid="cardNumberTouched && !cardNumberValid"
                  :aria-describedby="cardNumberTouched && !cardNumberValid ? 'card-number-error' : undefined"
                  class="w-full h-12 pl-12 pr-10 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-base tracking-wider"
                  :class="[cardNumberTouched && cardNumberValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cardNumberTouched && !cardNumberValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="cardNumberTouched && cardNumberValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="cardNumberTouched && !cardNumberValid" id="card-number-error" class="text-red-600 text-xs mt-1.5 flex items-center gap-1" role="alert">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Ingresa un número de tarjeta válido
              </p>
            </div>

            <div>
              <label for="card-name" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Nombre en la tarjeta
              </label>
              <div class="relative">
                <input
                  id="card-name"
                  v-model="cardName"
                  type="text"
                  placeholder="Como aparece en tu tarjeta"
                  @blur="cardNameTouched = true"
                  autocomplete="cc-name"
                  :aria-invalid="cardNameTouched && !cardNameValid"
                  :aria-describedby="cardNameTouched && !cardNameValid ? 'card-name-error' : undefined"
                  class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10"
                  :class="[cardNameTouched && cardNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cardNameTouched && !cardNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="cardNameTouched && cardNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="cardNameTouched && !cardNameValid" id="card-name-error" class="text-red-600 text-xs mt-1.5 flex items-center gap-1" role="alert">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Mínimo 3 caracteres
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="card-expiry" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                  Vencimiento
                </label>
                <div class="relative">
                  <input
                    id="card-expiry"
                    v-model="expiryDate"
                    @input="formatExpiry"
                    @blur="expiryTouched = true"
                    type="text"
                    inputmode="numeric"
                    placeholder="MM/AA"
                    maxlength="5"
                    autocomplete="cc-exp"
                    :aria-invalid="expiryTouched && !expiryValid"
                    :aria-describedby="expiryTouched && !expiryValid ? 'card-expiry-error' : undefined"
                    class="w-full h-12 px-4 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-center pr-10"
                    :class="[expiryTouched && expiryValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', expiryTouched && !expiryValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="expiryTouched && expiryValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="expiryTouched && !expiryValid" id="card-expiry-error" class="text-red-600 text-xs mt-1.5 flex items-center gap-1" role="alert">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  Requerido
                </p>
              </div>
              <div>
                <label for="card-cvv" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                  Código de seguridad
                </label>
                <div class="relative">
                  <input
                    id="card-cvv"
                    v-model="cvv"
                    type="text"
                    inputmode="numeric"
                    placeholder="CVV"
                    maxlength="4"
                    @blur="cvvTouched = true"
                    autocomplete="cc-csc"
                    :aria-invalid="cvvTouched && !cvvValid"
                    :aria-describedby="cvvTouched && !cvvValid ? 'card-cvv-error' : undefined"
                    class="w-full h-12 px-4 pr-12 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-center"
                    :class="[cvvTouched && cvvValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cvvTouched && !cvvValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="cvvTouched && cvvValid" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p v-if="cvvTouched && !cvvValid" id="card-cvv-error" class="text-red-600 text-xs mt-1.5 flex items-center gap-1" role="alert">
                  <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  Mínimo 3 dígitos
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="handleSubmit"
          :disabled="!isFormValid || isProcessing"
          class="w-full px-8 py-4 bg-yellow-400 text-slate-900 font-extrabold text-lg rounded-xl hover:bg-yellow-500 active:scale-[0.99] transition-all shadow-md hover:shadow-lg mx-auto block disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 disabled:hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
        >
          <svg v-if="isProcessing" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isProcessing">Procesando pago...</span>
          <span v-else>Pagar ${{ finalPrice.toFixed(2) }} USD</span>
        </button>

        <div class="flex flex-col items-center gap-3">
          <div class="flex items-center justify-center gap-2 text-sm text-slate-600">
            <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Pago 100% asistencia • Datos encriptados</span>
          </div>

          <div class="flex items-center justify-center gap-4 py-1">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png" alt="Visa" class="h-6 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" class="h-8 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/120px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-5 opacity-60" />
          </div>

          <button
            @click="handleSaveQuote"
            class="text-sm font-semibold text-cyan-700 hover:text-cyan-800 underline text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 rounded px-2 py-1"
          >
            📩 Guardar cotización y pagar después
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
