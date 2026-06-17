<script setup>
import { ref, computed } from 'vue'
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

function formatDestination(dest) {
  if (Array.isArray(dest)) return dest.map(d => d?.name || d).join(', ')
  if (typeof dest === 'object' && dest?.name) return dest.name
  return dest || 'No especificado'
}

function formatDate(date) {
  return fmtDate(date)
}

const UPGRADE_LABELS = {
  preexistencias: 'Preexistencias',
  deportes: 'Deportes',
  'futura-mama': 'Futura mamá',
  'equipaje-extra': 'Equipaje extra',
  'cancelacion-flex': 'Cancelación flexible'
}

function getUpgradesSummary() {
  const upgrades = props.data?.upgrades
  if (!upgrades || typeof upgrades !== 'object') return 'Sin upgrades'
  const ids = Object.values(upgrades).flat()
  if (ids.length === 0) return 'Sin upgrades'
  const names = ids.map(id => UPGRADE_LABELS[id] || id)
  if (names.length <= 2) return names.join(', ')
  return `${names.length} coberturas extra`
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

const errors = ref({
  cardNumber: false,
  cardName: false,
  expiry: false,
  cvv: false
})

const cardNumberDigits = computed(() => cardNumber.value.replace(/\s+/g, ''))

function luhnCheck(num) {
  const digits = num.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

function validateCardNumber() {
  const cleanNumber = cardNumberDigits.value
  const isDigitsOnly = /^\d+$/.test(cleanNumber)
  const hasValidLength = cleanNumber.length >= 13 && cleanNumber.length <= 19
  if (!isDigitsOnly || !hasValidLength) {
    errors.value.cardNumber = true
    return false
  }
  errors.value.cardNumber = false
  return true
}

function validateCardName() {
  errors.value.cardName = cardName.value.trim().length <= 2
  return !errors.value.cardName
}

function validateExpiry() {
  const m = expiryDate.value.match(/^(\d{2})\/(\d{2})$/)
  if (!m) {
    errors.value.expiry = true
    return false
  }
  const month = parseInt(m[1], 10)
  errors.value.expiry = !(month >= 1 && month <= 12)
  return !errors.value.expiry
}

function validateCvv() {
  errors.value.cvv = cvv.value.length < 3
  return !errors.value.cvv
}

const isDev = import.meta.env.DEV

const cardNumberValid = computed(() => {
  const digits = cardNumberDigits.value
  const hasMinLength = digits.length >= 13 && digits.length <= 19
  if (isDev) {
    return hasMinLength
  }
  if (!cardNumberTouched.value) {
    return digits.length === 16
  }
  if (errors.value.cardNumber) return false
  return luhnCheck(cardNumber.value)
})
const cardNameValid = computed(() => !errors.value.cardName && cardName.value.trim().length > 2)
const expiryValid = computed(() => !errors.value.expiry)
const cvvValid = computed(() => !errors.value.cvv && cvv.value.length >= 3)

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
  showToast('¡Cotización guardada! Te enviaremos un recordatorio.', { variant: 'success', duration: 4000 })
}

function handleSubmit() {
  if (!isFormValid.value || isProcessing.value) return
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
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

      <aside class="lg:col-span-2 lg:order-2 lg:sticky lg:top-4 lg:self-start space-y-2">
        <div v-if="data?.selectedPlan" class="bg-gradient-to-r from-[primary-500] to-[primary-700] rounded-2xl p-4 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="min-w-0">
                <p class="text-[10px] text-yellow-300 font-semibold uppercase tracking-wider mb-0.5">Tu plan</p>
                <p class="text-white font-bold text-base truncate">{{ getPlanName() }}</p>
                <p class="text-cyan-100 text-[11px]">Cobertura {{ getPlanCoverage() }} USD</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-2xl font-black text-yellow-300">${{ getPlanPrice() }}</p>
              <p class="text-cyan-100 text-[10px]">USD</p>
            </div>
          </div>
          <div v-if="appliedDiscount" class="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-[11px] text-emerald-300 font-medium">Ahorras con {{ appliedDiscount.code }}</span>
            <span class="text-sm font-bold text-emerald-300">-${{ discountAmount.toFixed(2) }} USD</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          <div class="grid grid-cols-2">
            <div class="p-2.5">
              <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Origen</p>
              <p class="font-semibold text-slate-800 text-xs truncate">
                {{ data?.origin?.name || data?.origin || '—' }}
              </p>
            </div>
            <div class="p-2.5 border-l border-slate-100">
              <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Destinos</p>
              <p class="font-semibold text-slate-800 text-xs truncate">
                {{ formatDestination(data?.destination) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="p-2.5">
              <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Fechas</p>
              <p class="font-semibold text-slate-800 text-xs truncate">
                {{ formatDate(data?.dates?.start) }} — {{ formatDate(data?.dates?.end) }}
              </p>
            </div>
            <div class="p-2.5 border-l border-slate-100">
              <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Viajeros</p>
              <p class="font-semibold text-slate-800 text-xs">{{ travelersLabels[data?.travelers] || data?.travelers || '—' }}</p>
            </div>
          </div>

          <div class="p-2.5">
            <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Upgrades</p>
            <p class="font-semibold text-slate-800 text-xs">{{ getUpgradesSummary() }}</p>
          </div>

          <div class="p-2.5">
            <p class="text-[10px] text-slate-500 font-semibold tracking-wide mb-0.5">Contacto de emergencia</p>
            <p class="font-semibold text-slate-800 text-xs truncate">{{ data?.emergencyContact?.name || data?.personalData?.name || '—' }}</p>
            <p v-if="data?.emergencyContact?.phone || data?.personalData?.phone" class="text-[11px] text-slate-500">
              {{ data?.emergencyContact?.phone || data?.personalData?.phone }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <button type="button"
            @click="$emit('go-to-step', STEPS.ORIGIN)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar origen"
          >Origen</button>
          <span aria-hidden="true">·</span>
          <button type="button"
            @click="$emit('go-to-step', STEPS.DESTINATION)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar destinos"
          >Destinos</button>
          <span aria-hidden="true">·</span>
          <button type="button"
            @click="$emit('go-to-step', STEPS.DATES)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar fechas"
          >Fechas</button>
          <span aria-hidden="true">·</span>
          <button type="button"
            @click="$emit('go-to-step', STEPS.TRAVELERS)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar viajeros"
          >Viajeros</button>
          <span aria-hidden="true">·</span>
          <button type="button"
            @click="$emit('go-to-step', STEPS.UPGRADES)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar upgrades"
          >Upgrades</button>
          <span aria-hidden="true">·</span>
          <button type="button"
            @click="$emit('go-to-step', STEPS.DATA)"
            class="hover:text-cyan-600 transition-colors focus:outline-none focus-visible:underline"
            aria-label="Editar contacto de emergencia"
          >Contacto</button>
        </div>
      </aside>

      <section class="lg:col-span-3 lg:order-1 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2 lg:-mr-2">
        <form
          @submit.prevent="handleSubmit"
          class="space-y-4"
          novalidate
        >
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

        <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          <div class="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <div class="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center">
              <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tarjeta de Crédito o Débito</h3>
          </div>

          <div class="space-y-3">
            <div>
              <label for="card-number" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Número de tarjeta
              </label>
              <div class="relative">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <input
                  id="card-number"
                  v-model="cardNumber"
                  @input="formatCardNumber"
                  @blur="cardNumberTouched = true; validateCardNumber()"
                  type="text"
                  inputmode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  autocomplete="cc-number"
                  title="Número de 16 dígitos que aparece al frente de tu tarjeta"
                  :aria-invalid="cardNumberTouched && !cardNumberValid"
                  :aria-describedby="cardNumberTouched && !cardNumberValid ? 'card-number-error' : undefined"
                  class="w-full h-11 pl-11 pr-10 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-sm tracking-wider"
                  :class="[cardNumberTouched && cardNumberValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cardNumberTouched && !cardNumberValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="cardNumberTouched && cardNumberValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="cardNumberTouched && !cardNumberValid" id="card-number-error" class="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
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
                  title="Tal cual aparece en la tarjeta, sin abreviaciones"
                  @blur="cardNameTouched = true; validateCardName()"
                  autocomplete="cc-name"
                  :aria-invalid="cardNameTouched && !cardNameValid"
                  :aria-describedby="cardNameTouched && !cardNameValid ? 'card-name-error' : undefined"
                  class="w-full h-11 px-3.5 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none pr-10 text-sm"
                  :class="[cardNameTouched && cardNameValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cardNameTouched && !cardNameValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                />
                <div v-if="cardNameTouched && cardNameValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p v-if="cardNameTouched && !cardNameValid" id="card-name-error" class="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
                <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Mínimo 3 caracteres
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="card-expiry" class="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                  Vencimiento
                </label>
                <div class="relative">
                  <input
                    id="card-expiry"
                    v-model="expiryDate"
                    @input="formatExpiry"
                    @blur="expiryTouched = true; validateExpiry()"
                    type="text"
                    inputmode="numeric"
                    placeholder="MM/AA"
                    title="Fecha de vencimiento en formato MM/AA (mes y año)"
                    maxlength="5"
                    autocomplete="cc-exp"
                    :aria-invalid="expiryTouched && !expiryValid"
                    :aria-describedby="expiryTouched && !expiryValid ? 'card-expiry-error' : undefined"
                    class="w-full h-11 px-3.5 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-center text-sm pr-10"
                    :class="[expiryTouched && expiryValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', expiryTouched && !expiryValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="expiryTouched && expiryValid" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p v-if="expiryTouched && !expiryValid" id="card-expiry-error" class="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
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
                    title="Código de 3 dígitos al reverso de tu tarjeta"
                    maxlength="4"
                    @blur="cvvTouched = true; validateCvv()"
                    autocomplete="cc-csc"
                    :aria-invalid="cvvTouched && !cvvValid"
                    :aria-describedby="cvvTouched && !cvvValid ? 'card-cvv-error' : undefined"
                    class="w-full h-11 px-3.5 pr-11 bg-slate-50 border rounded-xl text-slate-700 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 outline-none text-center text-sm"
                    :class="[cvvTouched && cvvValid ? 'border-green-300 bg-green-50/30' : 'border-slate-200', cvvTouched && !cvvValid ? 'border-red-300 ring-4 ring-red-50' : '']"
                  />
                  <div v-if="cvvTouched && cvvValid" class="absolute right-9 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p v-if="cvvTouched && !cvvValid" id="card-cvv-error" class="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
                  Mínimo 3 dígitos
                </p>
              </div>
            </div>
          </div>
        </div>

          <div class="lg:sticky lg:bottom-0 lg:bg-white lg:-mx-2 lg:px-2 lg:pt-4 lg:pb-2 lg:border-t lg:border-slate-100 lg:z-10">
            <p v-if="isProcessing" class="text-xs text-slate-500 text-center mb-2" role="status" aria-live="polite">
              {{ processingStep }}
            </p>
            <button
              type="submit"
              :disabled="!isFormValid || isProcessing"
              :aria-busy="isProcessing"
              class="w-full px-6 py-3.5 bg-yellow-400 text-slate-900 font-extrabold text-base rounded-xl transition-all shadow-md mx-auto block disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed enabled:hover:bg-yellow-500 enabled:active:scale-[0.99] enabled:hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
            >
              <svg v-if="isProcessing" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-if="isProcessing">Procesando…</span>
              <span v-else>Pagar ${{ finalPrice.toFixed(2) }} USD</span>
            </button>

            <div class="flex flex-col items-center gap-2 pt-3">
              <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Pago 100% encriptado</span>
              </div>

              <div class="flex items-center justify-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png" alt="Visa" class="h-5 opacity-50" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" class="h-6 opacity-50" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/120px-American_Express_logo_%282018%29.svg.png" alt="Amex" class="h-4 opacity-50" />
              </div>

              <button
                type="button"
                @click="handleSaveQuote"
                class="text-xs font-semibold text-cyan-700 hover:text-cyan-800 underline text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 rounded px-2 py-1"
              >
                Guardar cotización
              </button>
            </div>
          </div>
        </form>
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
