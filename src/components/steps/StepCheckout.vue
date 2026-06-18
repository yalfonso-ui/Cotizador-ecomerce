<script setup>
import { ref, computed, watch } from 'vue'
import DiscountCodeField from '@/components/ui/DiscountCodeField.vue'
import { getPlanPrice as planPrice, getPlanName as planName, getPlanCoverage as planCoverage } from '@/data/plans.js'
import { getUpgradesTotal } from '@/data/upgrades.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { showToast } from '@/composables/useToast.js'
import { STEPS } from '@/composables/useWizardSteps.js'

const emit = defineEmits(['payment-success', 'go-to-step'])

const props = defineProps({
  data: { type: Object, default: () => ({}) }
})

const travelersLabels = { solo: '1 viajero', pareja: '2 viajeros', familia: '4 viajeros', grupo: '6+ viajeros' }

function getPlanPrice() {
  return planPrice(props.data?.selectedPlan)
}

function getPlanName() {
  return planName(props.data?.selectedPlan)
}

function getPlanCoverage() {
  return planCoverage(props.data?.selectedPlan)
}

function formatDate(date) {
  return fmtDate(date)
}

function formatDestination(dest) {
  if (Array.isArray(dest)) return dest.map(d => d?.name || d).join(', ')
  if (typeof dest === 'object' && dest?.name) return dest.name
  return dest || 'No especificado'
}

const isProcessing = ref(false)
const processingStep = ref('')
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
const submitAttempted = ref(false)

const cardNumberDigits = computed(() => cardNumber.value.replace(/\s+/g, ''))

const cardNumberValid = computed(() => {
  const digits = cardNumberDigits.value
  return digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits)
})

const cardNameValid = computed(() => cardName.value.replace(/\s+/g, '').length >= 3)

const expiryValid = computed(() => {
  const m = expiryDate.value.match(/^(\d{2})\/(\d{2})$/)
  if (!m) return false
  const month = parseInt(m[1], 10)
  return month >= 1 && month <= 12
})

const cvvValid = computed(() => /^\d{3,4}$/.test(cvv.value))

const cardNumberError = computed(() => (cardNumberTouched.value || submitAttempted.value) && !cardNumberValid.value)
const cardNameError = computed(() => (cardNameTouched.value || submitAttempted.value) && !cardNameValid.value)
const expiryError = computed(() => (expiryTouched.value || submitAttempted.value) && !expiryValid.value)
const cvvError = computed(() => (cvvTouched.value || submitAttempted.value) && !cvvValid.value)

const isFormValid = computed(() => cardNumberValid.value && cardNameValid.value && expiryValid.value && cvvValid.value)

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  return (getPlanPrice() * appliedDiscount.value.discountPercent) / 100
})

const upgradesTotal = computed(() => getUpgradesTotal(props.data?.upgrades))

const finalPrice = computed(() => {
  return Math.max(0, (getPlanPrice() - discountAmount.value) + upgradesTotal.value)
})

function formatCardNumber(e) {
  const inputValue = e?.target?.value ?? e
  const raw = String(inputValue).replace(/\D/g, '').slice(0, 19)
  cardNumber.value = raw.match(/.{1,4}/g)?.join(' ') || raw
}

function onCardNumberInput(e) {
  formatCardNumber(e)
}

function onCardNumberBlur() {
  cardNumberTouched.value = true
}

function formatExpiry(e) {
  const inputValue = e?.target?.value ?? e
  const raw = String(inputValue).replace(/\D/g, '').slice(0, 4)
  if (raw.length <= 2) {
    expiryDate.value = raw
  } else {
    expiryDate.value = raw.slice(0, 2) + '/' + raw.slice(2, 4)
  }
}

function onExpiryInput(e) {
  formatExpiry(e)
}

function onExpiryBlur() {
  expiryTouched.value = true
}

function onCvvInput(e) {
  const inputValue = e?.target?.value ?? e
  cvv.value = String(inputValue).replace(/\D/g, '').slice(0, 4)
}

function onCvvBlur() {
  cvvTouched.value = true
}

function onCardNameInput(e) {
  cardName.value = e.target.value
}

function onCardNameBlur() {
  cardNameTouched.value = true
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
  showToast('¡Cotización guardada! Te enviaremos un recordatorio.', { variant: 'success', duration: 4000 })
}

function handleSubmit() {
  if (isProcessing.value) return
  submitAttempted.value = true
  cardNumberTouched.value = true
  cardNameTouched.value = true
  expiryTouched.value = true
  cvvTouched.value = true

  if (!isFormValid.value) {
    showToast('Revisa los datos de pago antes de continuar', { variant: 'error', duration: 3000 })
    return
  }

  isProcessing.value = true
  processingStep.value = 'Validando tarjeta…'
  setTimeout(() => {
    processingStep.value = 'Procesando pago…'
  }, 500)
  setTimeout(() => {
    processingStep.value = 'Confirmando con la aseguradora…'
  }, 1000)
  setTimeout(() => {
    isProcessing.value = false
    processingStep.value = ''
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
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

      <section class="lg:col-span-7 space-y-5">
        <div>
          <DiscountCodeField
            :modelValue="appliedDiscount"
            @apply="handleApplyDiscount"
            @remove="handleRemoveDiscount"
          />

          <Transition name="fade">
            <p v-if="discountError" class="mt-2 text-red-600 text-xs flex items-center gap-1 px-1" role="alert">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              {{ discountError }}
            </p>
          </Transition>

          <div v-if="appliedDiscount" class="mt-3 bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600">Subtotal</span>
              <span class="font-semibold text-slate-700">${{ getPlanPrice() }} USD</span>
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
        </div>

        <div class="bg-white border-2 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm" :class="submitAttempted && !isFormValid ? 'border-red-200' : 'border-slate-200'">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-800">Tarjeta de Crédito o Débito</h3>
          </div>

          <div>
            <label for="card-number" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
              Número de tarjeta
            </label>
            <input
              id="card-number"
              :value="cardNumber"
              @input="onCardNumberInput"
              @blur="onCardNumberBlur"
              type="text"
              inputmode="numeric"
              placeholder="1234 5678 9012 3456"
              maxlength="23"
              autocomplete="cc-number"
              :aria-invalid="cardNumberError"
              :aria-describedby="cardNumberError ? 'card-number-error' : undefined"
              class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-base tracking-wider"
              :class="[
                cardNumberError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-50'
              ]"
            />
            <p v-if="cardNumberError" id="card-number-error" class="mt-1.5 text-red-600 text-xs flex items-center gap-1" role="alert">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Ingresa un número de tarjeta válido (13 a 19 dígitos)
            </p>
          </div>

          <div>
            <label for="card-name" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
              Nombre del titular
            </label>
            <input
              id="card-name"
              :value="cardName"
              @input="onCardNameInput"
              @blur="onCardNameBlur"
              type="text"
              placeholder="Como aparece en tu tarjeta"
              autocomplete="cc-name"
              :aria-invalid="cardNameError"
              :aria-describedby="cardNameError ? 'card-name-error' : undefined"
              class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none"
              :class="[
                cardNameError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-50'
              ]"
            />
            <p v-if="cardNameError" id="card-name-error" class="mt-1.5 text-red-600 text-xs flex items-center gap-1" role="alert">
              <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Ingresa el nombre completo del titular (mínimo 3 caracteres)
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="card-expiry" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Vencimiento
              </label>
              <input
                id="card-expiry"
                :value="expiryDate"
                @input="onExpiryInput"
                @blur="onExpiryBlur"
                type="text"
                inputmode="numeric"
                placeholder="MM/AA"
                maxlength="5"
                autocomplete="cc-exp"
                :aria-invalid="expiryError"
                :aria-describedby="expiryError ? 'card-expiry-error' : undefined"
                class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-center tracking-wider"
                :class="[
                  expiryError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-50'
                ]"
              />
              <p v-if="expiryError" id="card-expiry-error" class="mt-1.5 text-red-600 text-xs flex items-center gap-1" role="alert">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Formato MM/AA (mes 01-12)
              </p>
            </div>
            <div>
              <label for="card-cvv" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                CVV
              </label>
              <input
                id="card-cvv"
                :value="cvv"
                @input="onCvvInput"
                @blur="onCvvBlur"
                type="text"
                inputmode="numeric"
                placeholder="123"
                maxlength="4"
                autocomplete="cc-csc"
                :aria-invalid="cvvError"
                :aria-describedby="cvvError ? 'card-cvv-error' : undefined"
                class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none text-center tracking-wider"
                :class="[
                  cvvError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : 'border-slate-200 focus:border-cyan-400 focus:ring-cyan-50'
                ]"
              />
              <p v-if="cvvError" id="card-cvv-error" class="mt-1.5 text-red-600 text-xs flex items-center gap-1" role="alert">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                CVV de 3 o 4 dígitos
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="handleSubmit"
          :disabled="isProcessing"
          class="w-full px-8 py-4 bg-yellow-400 text-slate-900 font-extrabold text-lg rounded-xl hover:bg-yellow-500 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
        >
          <svg v-if="isProcessing" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-if="isProcessing">{{ processingStep }}</span>
          <span v-else>Pagar ${{ finalPrice.toFixed(2) }} USD</span>
        </button>

        <button
          type="button"
          @click="handleSaveQuote"
          class="w-full text-sm font-semibold text-cyan-700 hover:text-cyan-800 underline text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 rounded px-2 py-1"
        >
          📩 Guardar cotización y pagar después
        </button>

        <div class="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Pago 100% seguro • Datos encriptados</span>
        </div>
      </section>

      <aside class="lg:col-span-5 space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div v-if="data?.selectedPlan" class="bg-[#00184C] rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center shrink-0">
                <span class="text-lg" aria-hidden="true">🛡️</span>
              </div>
              <div class="min-w-0">
                <p class="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider mb-0.5">Tu plan</p>
                <p class="text-white font-bold text-base truncate">{{ getPlanName() }}</p>
                <p class="text-cyan-100 text-[11px]">Cobertura {{ getPlanCoverage() }} USD</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-2xl font-bold text-yellow-400">${{ getPlanPrice() }}</p>
              <p class="text-cyan-200 text-[10px]">USD</p>
            </div>
          </div>
          <div v-if="appliedDiscount" class="pt-3 border-t border-white/15 flex items-center justify-between">
            <span class="text-[11px] text-emerald-300 font-medium">Ahorras con {{ appliedDiscount.code }}</span>
            <span class="text-sm font-bold text-emerald-300">-${{ discountAmount.toFixed(2) }} USD</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div class="p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
              <span class="text-base" aria-hidden="true">🌎</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Ruta</p>
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ data?.origin?.name || data?.origin || 'Origen' }}
                <span class="text-slate-400 mx-1">→</span>
                {{ formatDestination(data?.destination) }}
              </p>
            </div>
            <button
              type="button"
              @click="$emit('go-to-step', 0)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar ruta"
            >
              Editar
            </button>
          </div>

          <div class="p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
              <span class="text-base" aria-hidden="true">📅</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Fechas</p>
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ formatDate(data?.dates?.start) }} — {{ formatDate(data?.dates?.end) }}
              </p>
            </div>
            <button
              type="button"
              @click="$emit('go-to-step', STEPS.DATES)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar fechas"
            >
              Editar
            </button>
          </div>

          <div class="p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
              <span class="text-base" aria-hidden="true">👥</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Viajeros</p>
              <p class="font-semibold text-slate-800 text-sm">{{ travelersLabels[data?.travelers] || data?.travelers || '—' }}</p>
            </div>
            <button
              type="button"
              @click="$emit('go-to-step', 3)"
              class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Editar viajeros"
            >
              Editar
            </button>
          </div>

          <div class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                <span class="text-base" aria-hidden="true">👤</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Contacto de emergencia</p>
                <p class="font-semibold text-slate-800 text-sm truncate">{{ data?.emergencyContact?.name || data?.personalData?.name || '—' }}</p>
                <p v-if="data?.emergencyContact?.phone || data?.personalData?.phone" class="text-xs text-slate-500">
                  {{ data?.emergencyContact?.phone || data?.personalData?.phone }}
                </p>
              </div>
              <button
                type="button"
                @click="$emit('go-to-step', 5)"
                class="text-[11px] text-cyan-700 hover:text-cyan-800 font-semibold whitespace-nowrap px-2 py-1 rounded hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                aria-label="Editar contacto de emergencia"
              >
                Editar
              </button>
            </div>
            <p class="text-[11px] text-slate-500 mt-3 leading-snug">
              Datos confidenciales. Solo contactaremos en caso de emergencia real.
            </p>
          </div>
        </div>
      </aside>
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