<script setup>
import StepButton from '@/components/quote-flow/ui/StepButton.vue'

defineProps({
  quoteData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['restart'])

function restart() {
  emit('restart')
}
</script>

<template>
  <div class="text-center space-y-6 py-8">
    <div class="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
      <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <div>
      <h2 class="text-3xl font-extrabold text-slate-900 mb-2">¡Pago confirmado!</h2>
      <p class="text-slate-500">Tu asistencia de viaje está activa</p>
    </div>

    <div v-if="quoteData.policyNumber" class="bg-cyan-50 border border-cyan-200 rounded-xl p-4 my-6 text-center">
      <p class="text-xs text-slate-500 uppercase tracking-wid-wider mb-1">Número de póliza</p>
      <p class="text-xl font-mono font-bold text-cyan-600">{{ quoteData.policyNumber }}</p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-5 text-left shadow-sm space-y-4">
      <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">Resumen de tu seguro</h3>
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-slate-500 text-sm">Plan</span>
          <span class="font-semibold text-slate-800">{{ quoteData.selectedPlan?.name || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500 text-sm">Cobertura</span>
          <span class="font-semibold text-slate-800">{{ quoteData.selectedPlan?.coverage || '-' }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-slate-500 text-sm">Vigencia</span>
          <span class="font-semibold text-slate-800">
            {{ quoteData.dates?.start ? new Date(quoteData.dates.start).toLocaleDateString('es-ES') : '-' }}
            -
            {{ quoteData.dates?.end ? new Date(quoteData.dates.end).toLocaleDateString('es-ES') : '-' }}
          </span>
        </div>
      </div>
    </div>

    <div class="bg-cyan-50/50 rounded-xl p-4 text-left space-y-3">
      <p class="text-sm font-semibold text-cyan-800">¿Qué sigue?</p>
      <ul class="text-sm text-cyan-700 space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-cyan-500">✓</span>
          Recibirás un correo con los detalles de tu póliza
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyan-500">✓</span>
          Tienes acceso a teleconsulta 24/7
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyan-500">✓</span>
          Descarga tu certificado de cobertura
        </li>
      </ul>
    </div>

    <div class="pt-4">
      <StepButton
        @click="restart"
        variant="accent"
        text="Nueva cotización"
      />
    </div>
  </div>
</template>