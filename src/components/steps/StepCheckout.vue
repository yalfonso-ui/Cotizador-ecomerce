<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import DiscountCodeField from '@/components/ui/DiscountCodeField.vue'
import { getPlanPrice as planPrice, getPlanName as planName, getPlanCoverage as planCoverage } from '@/data/plans.js'
import { getUpgradesTotal } from '@/data/upgrades.js'
import { formatDate as fmtDate } from '@/composables/useDateFormatter.js'
import { getTravelerCount as resolveCount } from '@/composables/useTravelerInfo.js'
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
const isMobileSummaryExpanded = ref(false)

let dragStartY = 0
let dragCurrentY = 0
let isDragging = false
const dragOffset = ref(0)

const dragStyle = computed(() => {
  if (dragOffset.value === 0) return {}
  return { transform: `translateY(${dragOffset.value}px)`, transition: 'none' }
})

function onTouchStart(e) {
  if (e.touches.length !== 1) return
  dragStartY = e.touches[0].clientY
  isDragging = true
}

function onTouchMove(e) {
  if (!isDragging) return
  const delta = e.touches[0].clientY - dragStartY
  dragCurrentY = Math.max(0, delta)
  dragOffset.value = dragCurrentY
}

function onTouchEnd() {
  if (!isDragging) return
  isDragging = false
  if (dragCurrentY > 80) {
    isMobileSummaryExpanded.value = false
  }
  dragOffset.value = 0
  dragCurrentY = 0
}

watch(isMobileSummaryExpanded, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

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

const tripDays = computed(() => {
  if (!props.data?.dates?.start || !props.data?.dates?.end) return 0
  const start = new Date(props.data.dates.start)
  const end = new Date(props.data.dates.end)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const totalViajeros = computed(() => {
  const arr = props.data?.travelersInfo
  if (Array.isArray(arr) && arr.length > 0) return arr.length
  return resolveCount(props.data?.travelers, props.data?.travelersCount)
})

const travelersLabel = computed(() => {
  const n = totalViajeros.value
  if (!n || n < 1) return '—'
  return `${n} ${n === 1 ? 'viajero' : 'viajeros'}`
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
  appliedDiscount.value = discount
}

function handleRemoveDiscount() {
  appliedDiscount.value = null
}

function handleSubmit() {
  if (isProcessing.value) return
  submitAttempted.value = true
  cardNumberTouched.value = true
  cardNameTouched.value = true
  expiryTouched.value = true
  cvvTouched.value = true

  if (!isFormValid.value) {
    showToast('Revisa los datos de pago para finalizar tu compra', { variant: 'error', duration: 3000 })
    return
  }

  isProcessing.value = true
  processingStep.value = 'Validando tu tarjeta…'
  setTimeout(() => {
    processingStep.value = 'Procesando tu pago…'
  }, 500)
  setTimeout(() => {
    processingStep.value = 'Activando tu cobertura…'
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
  <div class="max-w-5xl mx-auto space-y-5 px-4 sm:px-6">
    <div class="lg:hidden sticky top-0 z-20 -mx-4 px-4 py-3 bg-white/85 backdrop-blur-md border-b border-slate-100/80">
      <button
        type="button"
        @click="isMobileSummaryExpanded = true"
        class="w-full flex items-center justify-between gap-3 text-left group"
        :aria-expanded="isMobileSummaryExpanded"
        aria-haspopup="dialog"
      >
        <span class="text-sm font-medium tracking-tight" style="color: #00184C;">
          Ver resumen de viaje
        </span>
        <span class="flex items-center gap-1.5">
          <span class="text-sm font-bold tabular-nums tracking-tight" style="color: #00184C;">
            ${{ finalPrice.toFixed(2) }} USD
          </span>
          <svg
            class="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-y-0.5"
            style="color: #00184C;"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="sheet-fade">
        <div
          v-if="isMobileSummaryExpanded"
          class="lg:hidden fixed inset-0 z-50 bg-[#00184C]/20 backdrop-blur-md"
          @click.self="isMobileSummaryExpanded = false"
          aria-hidden="true"
        ></div>
      </Transition>

      <Transition name="sheet">
        <div
          v-if="isMobileSummaryExpanded"
          ref="sheetRef"
          class="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-label="Resumen de viaje"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          :style="dragStyle"
        >
          <div class="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4" aria-hidden="true"></div>

          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold tracking-tight" style="color: #00184C;">
              Tu reserva
            </h2>
            <button
              type="button"
              @click="isMobileSummaryExpanded = false"
              class="w-8 h-8 -mr-2 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Cerrar resumen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <dl class="divide-y divide-slate-100">
            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu ruta</dt>
                <dd class="font-semibold text-slate-800 text-sm">
                  {{ data?.origin?.name || data?.origin || '—' }}
                  <span class="text-slate-300 mx-1">→</span>
                  {{ formatDestination(data?.destination) }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Fechas del viaje</dt>
                <dd class="font-semibold text-slate-800 text-sm">
                  <template v-if="data?.dates?.start && data?.dates?.end">
                    {{ formatDate(data?.dates?.start) }}
                    <span class="text-slate-300 mx-1">→</span>
                    {{ formatDate(data?.dates?.end) }}
                  </template>
                  <template v-else>—</template>
                </dd>
                <dd v-if="data?.dates?.start && data?.dates?.end" class="text-xs text-slate-400 mt-0.5">
                  {{ tripDays }} {{ tripDays === 1 ? 'día' : 'días' }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Viajeros</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ travelersLabel }}</dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-3">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu plan</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ getPlanName() }}</dd>
                <dd class="text-xs text-slate-400">Cobertura hasta {{ getPlanCoverage() }} USD</dd>
              </div>
            </div>
          </dl>

          <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
            <span class="text-lg font-bold tabular-nums" style="color: #00184C;">
              ${{ finalPrice.toFixed(2) }} USD
            </span>
          </div>

          <button
            type="button"
            @click="$emit('go-to-step', STEPS.DESTINATION); isMobileSummaryExpanded = false"
            class="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-colors"
            style="background-color: #F9D35A; color: #00184C;"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar reserva
          </button>
        </div>
      </Transition>
    </Teleport>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

      <section class="lg:col-span-7 space-y-4">
        <header class="space-y-2 text-center">
          <span class="ds-eyebrow">Último paso</span>
          <h1 class="ds-heading-1">Confirma tu <span style="color: #43D3FF;">pago</span></h1>
        </header>

        <div class="bg-white border-2 rounded-2xl p-4 md:p-5 space-y-3 shadow-sm" :class="submitAttempted && !isFormValid ? 'border-red-200' : 'border-slate-200'">
          <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: rgba(67, 211, 255, 0.12);">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style="color: #43D3FF;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-800">Tu método de pago</h3>
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
                cardNumberError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : (cardNumberTouched && cardNumberValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15')
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
              class="w-full h-12 px-4 bg-slate-50 border-2 rounded-xl text-slate-700 text-base placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:ring-4 outline-none"
              :class="[
                cardNameError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : (cardNameTouched && cardNameValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15')
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
                  expiryError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : (expiryTouched && expiryValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15')
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
                  cvvError ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/30' : (cvvTouched && cvvValid ? 'border-emerald-500 ring-2 ring-emerald-400/30 bg-emerald-50/40' : 'border-slate-200 focus:border-[#43D3FF] focus:ring-[#43D3FF]/15')
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
          class="bg-[#F9D35A] text-[#00184C] font-bold text-base flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full transition-all hover:brightness-95 shadow-sm w-full max-w-md mx-auto disabled:bg-slate-200 disabled:text-slate-400"
        >
          <span v-if="isProcessing" class="animate-spin w-5 h-5">⏳</span>
          <span v-if="isProcessing">{{ processingStep }}</span>
          <span v-else>
            <span class="hidden md:inline">Activa tu cobertura · ${{ finalPrice.toFixed(2) }} USD</span>
            <span class="md:hidden">Pagar ${{ finalPrice.toFixed(2) }} USD</span>
          </span>
          <svg v-if="!isProcessing" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-white transform rotate-45">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </button>

        <div class="flex items-center justify-center gap-2 text-xs pt-2" style="color: #00184C; opacity: 0.5;">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Tu pago está protegido de principio a fin</span>
        </div>
      </section>

      <aside class="hidden lg:block lg:col-span-5 space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 space-y-4">

          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Tu reserva</p>
            <button type="button" @click="$emit('go-to-step', STEPS.DESTINATION)" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00184C] transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar todo
            </button>
          </div>

          <dl class="divide-y divide-slate-100">
            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu ruta</dt>
                <dd class="font-semibold text-slate-800 text-sm truncate">
                  {{ data?.origin?.name || data?.origin || '—' }}
                  <span class="text-slate-300 mx-1">→</span>
                  {{ formatDestination(data?.destination) }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Fechas del viaje</dt>
                <dd class="font-semibold text-slate-800 text-sm truncate">
                  {{ data?.dates?.start ? formatDate(data?.dates?.start) : '—' }}
                  <span class="text-slate-300 mx-1">→</span>
                  {{ data?.dates?.end ? formatDate(data?.dates?.end) : '—' }}
                </dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Viajeros</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ travelersLabel }}</dd>
              </div>
            </div>

            <div class="flex items-start gap-3 py-2.5">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div class="flex-1 min-w-0">
                <dt class="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Tu plan</dt>
                <dd class="font-semibold text-slate-800 text-sm">{{ getPlanName() }}</dd>
                <dd class="text-xs text-slate-400">Cobertura hasta {{ getPlanCoverage() }} USD</dd>
              </div>
            </div>
          </dl>

          <DiscountCodeField
            :modelValue="appliedDiscount"
            @apply="handleApplyDiscount"
            @remove="handleRemoveDiscount"
          />

          <div class="space-y-2 pt-2 border-t border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C; opacity: 0.7;">Plan base</span>
              <span class="text-sm font-semibold" style="color: #00184C;">${{ getPlanPrice() }} USD</span>
            </div>
            <div v-if="upgradesTotal > 0" class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C; opacity: 0.7;">Coberturas adicionales</span>
              <span class="text-sm font-semibold" style="color: #00184C;">+${{ upgradesTotal }} USD</span>
            </div>
            <div v-if="appliedDiscount" class="flex items-center justify-between">
              <span class="text-sm" style="color: #00184C;">Descuento ({{ appliedDiscount.discountPercent }}%)</span>
              <span class="text-sm font-semibold" style="color: #00184C;">-${{ discountAmount.toFixed(2) }} USD</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-200">
              <span class="text-base font-bold" style="color: #00184C;">Total a pagar</span>
              <span class="text-xl font-bold" style="color: #00184C;">${{ finalPrice.toFixed(2) }} USD</span>
            </div>
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

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.28s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>