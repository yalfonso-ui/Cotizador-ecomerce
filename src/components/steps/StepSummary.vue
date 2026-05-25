<script setup>
import { ref, computed } from 'vue'

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

function handlePay() {
  if (isProcessing.value) return
  isProcessing.value = true
  setTimeout(() => {
    emit('pay')
  }, 1000)
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
      <p class="text-gray-500">Tu seguro de viaje está activo</p>
      <p class="text-lg font-bold text-cyan-600 mt-2">${{ getPlanPrice() }} USD</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 space-y-5">
        <div class="flex items-start gap-4 group">
          <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <span class="text-xl">🌎</span>
          </div>
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
          <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <span class="text-xl">📅</span>
          </div>
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
          <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <span class="text-xl">👥</span>
          </div>
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
          <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
            <span class="text-xl">👤</span>
          </div>
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
      <span v-else>Pagar ${{ getPlanPrice() }} USD</span>
    </button>

    <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Pago 100% seguro • Datos encriptados</span>
    </div>
  </div>
</template>