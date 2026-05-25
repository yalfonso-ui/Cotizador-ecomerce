<script setup>
const emit = defineEmits(['restart-flow'])

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  amount: {
    type: Number,
    default: 0
  }
})

const voucherCode = 'CA-B4ZADX-US'

const planNames = {
  essential: 'Essential',
  explorer: 'Explorer',
  premium: 'Premium'
}

const travelersLabels = {
  solo: '1 persona',
  pareja: '2 personas',
  familia: '3-5 personas',
  grupo: '6+ personas'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function handleRestart() {
  emit('restart-flow')
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm overflow-hidden w-full">
    <div class="bg-[#0B1A3D] p-8">
      <h1 class="text-[#00D1FF] text-4xl font-bold">Disfruta tu viaje!</h1>
    </div>

    <div class="grid md:grid-cols-2 gap-8 p-8">
      <div class="flex flex-col justify-center items-center text-center">
        <p class="text-slate-600 mb-4">Código de voucher:</p>
        <div class="bg-[#0B1A3D] text-white text-xl font-bold px-6 py-3 rounded-lg tracking-wider">
          {{ voucherCode }}
        </div>
      </div>

      <div>
        <h3 class="text-[#0B1A3D] font-bold text-xl mb-4">Detalles del viaje</h3>
        
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-[#00D1FF]">🌎</span>
            <div>
              <p class="text-xs text-slate-400 uppercase">Ruta</p>
              <p class="text-slate-800 font-medium">
                {{ data?.origin?.name || data?.origin || '-' }} → {{ data?.destination?.name || data?.destination || '-' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[#00D1FF]">📅</span>
            <div>
              <p class="text-xs text-slate-400 uppercase">Ida</p>
              <p class="text-slate-800 font-medium">{{ formatDate(data?.dates?.start) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[#00D1FF]">📅</span>
            <div>
              <p class="text-xs text-slate-400 uppercase">Vuelta</p>
              <p class="text-slate-800 font-medium">{{ formatDate(data?.dates?.end) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[#00D1FF]">👥</span>
            <div>
              <p class="text-xs text-slate-400 uppercase">Viajeros</p>
              <p class="text-slate-800 font-medium">{{ travelersLabels[data?.travelers] || data?.travelers || '-' }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[#00D1FF]">🛡️</span>
            <div>
              <p class="text-xs text-slate-400 uppercase">Plan</p>
              <p class="text-slate-800 font-medium">{{ planNames[data?.selectedPlan] || '-' }}</p>
            </div>
          </div>
        </div>

        <hr class="my-4 border-slate-200" />

        <div class="flex justify-between items-center">
          <span class="text-slate-600 font-medium">Total</span>
          <span class="text-2xl font-bold text-slate-900">${{ amount }} USD</span>
        </div>
      </div>
    </div>

    <div class="flex gap-4 p-8 pt-0">
      <button
        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Descargar PDF
      </button>
      <button
        @click="handleRestart"
        class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Regresar al inicio
      </button>
    </div>
  </div>
</template>