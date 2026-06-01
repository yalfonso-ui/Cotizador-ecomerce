<script setup>
import { ref } from 'vue'
import StepButton from '@/components/quote-flow/ui/StepButton.vue'

const emit = defineEmits(['select-plan', 'next'])

const selectedPlan = ref(null)

const plans = [
  {
    id: 'essential',
    name: 'Essential',
    price: 25,
    coverage: '$15,000 USD',
    features: ['Emergencias médicas', 'Repatriación básica', 'Teleconsulta 24/7', 'COVID-19'],
    popular: false
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 40,
    coverage: '$50,000 USD',
    features: ['Todo de Essential', 'Cancelación de viaje', 'Equipaje protegido', 'COVID-19 incluido', 'Asistencia 24/7'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 65,
    coverage: '$100,000 USD',
    features: ['Todo de Explorer', 'Seguro de actividades', 'Mayores límites', 'Concierge personal', 'Cobertura familiar'],
    popular: false
  }
]

function selectPlan(plan) {
  selectedPlan.value = plan
  emit('select-plan', plan)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-3 gap-4">
      <button
        v-for="plan in plans"
        :key="plan.id"
        @click="selectPlan(plan)"
        class="relative p-6 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center"
        :class="selectedPlan?.id === plan.id
          ? 'border-[#0B1A3D] bg-blue-50/50 shadow-md'
          : 'border-slate-200 bg-white hover:border-cyan-500'"
      >
        <span
          v-if="plan.popular"
          class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-300 text-primary-500 text-xs font-bold rounded-full shadow-sm"
        >
          Popular
        </span>

        <h3 class="font-semibold text-lg mb-2 text-slate-800">{{ plan.name }}</h3>

        <div class="mb-4">
          <span class="text-4xl font-bold text-slate-900">${{ plan.price }}</span>
          <span class="text-sm text-slate-500">USD</span>
        </div>

        <p class="text-sm text-slate-500 mb-4">Cobertura {{ plan.coverage }}</p>

        <ul class="text-left space-y-2 flex-1 w-full">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4 shrink-0 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span class="text-slate-700">{{ feature }}</span>
          </li>
        </ul>
      </button>
    </div>

    <StepButton
      @click="() => { if(selectedPlan) emit('next') }"
      :disabled="!selectedPlan"
      variant="accent"
      text="Continuar"
    />
  </div>
</template>