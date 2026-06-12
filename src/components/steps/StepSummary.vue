<script setup>
import { ref, computed } from 'vue'
import DiscountCodeField from '@/components/ui/DiscountCodeField.vue'

const emit = defineEmits(['go-to-step', 'pay'])

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  isFinal: {
    type: Boolean,
    default: false
  }
})

const isProcessing = ref(false)
const appliedDiscount = ref(null)
const discountError = ref('')

const planNames = {
  essential: 'Essential',
  explorer: 'Explorer',
  premium: 'Premium'
}

const planPrices = {
  essential: 25,
  explorer: 40,
  premium: 65
}

const travelersLabels = {
  solo: '1 persona',
  pareja: '2 personas',
  familia: '3-5 personas',
  grupo: '6+ personas'
}

function formatDate(date) {
  if (!date) return 'No seleccionada'
  try {
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch (e) {
    return 'Fecha inválida'
  }
}

function getPlanPrice() {
  const plan = props.data?.selectedPlan
  if (!plan) return 0
  return planPrices[plan] || 0
}

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0
  return (getPlanPrice() * appliedDiscount.value.discountPercent) / 100
})

const finalPrice = computed(() => {
  return Math.max(0, getPlanPrice() - discountAmount.value)
})

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

function handlePay() {
  if (isProcessing.value) return
  isProcessing.value = true
  setTimeout(() => {
    emit('pay')
  }, 1000)
}

function handleSaveQuote() {
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium animate-fade-in'
  toast.textContent = '¡Cotización enviada a tu correo!'
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="isFinal" class="text-center py-4">
      <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">¡Pago exitoso!</h2>
      <p class="text-gray-500">Tu asistencia de viaje está activa</p>
      <p class="text-lg font-bold text-cyan-600 mt-2">${{ finalPrice.toFixed(2) }} USD</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 space-y-5">
        <div class="flex items-start gap-4 group">
          
          <div class="flex-1">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Ruta</p>
            <p class="font-semibold text-gray-800 text-lg">
              {{ data?.origin?.name || data?.origin || 'No seleccionado' }}
              <span class="text-gray-400 mx-2">→</span>
              {{ data?.destination?.name || data?.destination || 'No seleccionado' }}
            </p>
          </div>
          <button
            v-if="!isFinal"
            @click="$emit('go-to-step', 0)"
            class="flex items-center gap-1 text-[#00D1FF] hover:text-[#00184C] text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 active:bg-cyan-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
        </div>

        <div class="h-px bg-gray-100"></div>

        <div class="flex items-start gap-4 group">
          
          <div class="flex-1">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Fechas</p>
            <p class="font-medium text-gray-800">
              {{ formatDate(data?.dates?.start) }}
              <span class="text-gray-400 mx-2">→</span>
              {{ formatDate(data?.dates?.end) }}
            </p>
          </div>
          <button
            v-if="!isFinal"
            @click="$emit('go-to-step', 2)"
            class="flex items-center gap-1 text-[#00D1FF] hover:text-[#00184C] text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 active:bg-cyan-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
        </div>

        <div class="h-px bg-gray-100"></div>

        <div class="flex items-start gap-4 group">
          
          <div class="flex-1">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Viajeros</p>
            <p class="font-medium text-gray-800">
              {{ travelersLabels[data?.travelers] || data?.travelers || 'No seleccionados' }}
            </p>
          </div>
          <button
            v-if="!isFinal"
            @click="$emit('go-to-step', 3)"
            class="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
        </div>

        <div class="h-px bg-gray-100"></div>

        <div v-if="data?.personalData?.name" class="flex items-start gap-4 group">
          
          <div class="flex-1">
            <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Datos de contacto</p>
            <p class="font-medium text-gray-800">{{ data.personalData.name }}</p>
            <p class="text-sm text-gray-500">{{ data.personalData.email }}</p>
            <p class="text-sm text-gray-500">{{ data.personalData.phone }}</p>
          </div>
          <button
            v-if="!isFinal"
            @click="$emit('go-to-step', 6)"
            class="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar
          </button>
        </div>
      </div>

      <div v-if="data?.selectedPlan" class="bg-gradient-to-r from-slate-800 to-slate-900 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-yellow-400/20 flex items-center justify-center">
              <span class="text-2xl">🛡️</span>
            </div>
            <div>
              <p class="text-xs text-cyan-400 uppercase tracking-wide mb-1">Plan seleccionado</p>
              <h3 class="text-xl font-bold text-white">{{ planNames[data.selectedPlan] }}</h3>
              <p class="text-sm text-gray-400">Cobertura ${{ data.selectedPlan === 'essential' ? '15,000' : data.selectedPlan === 'explorer' ? '50,000' : '100,000' }} USD</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-3xl font-bold text-yellow-400">${{ getPlanPrice() }}</p>
            <p class="text-sm text-gray-400">USD</p>
          </div>
        </div>
        <button
          v-if="!isFinal"
          @click="$emit('go-to-step', 5)"
          class="mt-4 text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Cambiar plan
        </button>
      </div>
    </div>

    <div v-if="!isFinal">
      <DiscountCodeField
        :modelValue="appliedDiscount"
        @apply="handleApplyDiscount"
        @remove="handleRemoveDiscount"
      />

      <Transition name="fade">
        <p v-if="discountError" class="mt-2 text-red-500 text-xs flex items-center gap-1" role="alert">
          <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          {{ discountError }}
        </p>
      </Transition>

      <div v-if="appliedDiscount" class="mt-3 bg-slate-50 rounded-xl p-4 space-y-2">
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
    </div>

    <button
      v-if="data?.selectedPlan && !isFinal"
      @click="handlePay"
      :disabled="isProcessing"
      class="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <svg v-if="isProcessing" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="isProcessing">Preparando pago...</span>
      <span v-else>Pagar ${{ finalPrice.toFixed(2) }} USD</span>
    </button>

    <button
      v-if="data?.selectedPlan && !isFinal"
      @click="handleSaveQuote"
      class="w-full text-sm font-medium text-cyan-600 hover:text-cyan-700 underline mt-4 text-center cursor-pointer block"
    >
      📩 Enviarme esta cotización por correo para más tarde
    </button>

    <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Pago 100% asistencia • Datos encriptados</span>
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