<script setup>
import { ref } from 'vue'

const emit = defineEmits(['update'])

const props = defineProps({
  modelValue: String
})

const selectedPlan = ref(props.modelValue)

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
  selectedPlan.value = plan.id
  emit('update', plan.id)
}

function handleNext() {
  if (selectedPlan.value) {
    emit('next', { selectedPlan: selectedPlan.value })
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-3 gap-4">
      <button
        v-for="plan in plans"
        :key="plan.id"
        @click="selectPlan(plan)"
        class="relative p-6 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col"
        :class="(selectedPlan === plan.id)
          ? 'border-cyan-500 ring-4 ring-cyan-500/20 bg-cyan-50/30 shadow-lg'
          : (plan.popular)
          ? 'border-[#00184C] bg-white shadow-lg hover:border-cyan-500 hover:ring-4 hover:ring-cyan-500/20'
          : 'border-gray-200 bg-white hover:border-[#00184C] hover:ring-4 hover:ring-[#00184C]/20'"
      >
        <span
          v-if="plan.popular"
          class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full"
        >
          Popular
        </span>

        <div class="flex items-center justify-center mb-2">
          <div v-if="selectedPlan === plan.id" class="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 class="font-semibold text-lg mb-2" :class="selectedPlan === plan.id ? 'text-cyan-700' : 'text-gray-800'">{{ plan.name }}</h3>

        <div class="mb-4">
          <span class="text-3xl font-bold" :class="selectedPlan === plan.id ? 'text-cyan-600' : 'text-gray-900'">${{ plan.price }}</span>
          <span class="text-sm opacity-60">USD</span>
        </div>

        <p class="text-sm opacity-60 mb-4">Cobertura {{ plan.coverage }}</p>

        <ul class="text-left space-y-2 flex-1">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-2 text-sm"
            :class="selectedPlan === plan.id ? 'text-cyan-700' : 'text-gray-600'"
          >
            <svg class="w-4 h-4 shrink-0" :class="selectedPlan === plan.id ? 'text-cyan-500' : 'text-cyan-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>
      </button>
    </div>

    <button
      @click="handleNext"
      :disabled="!selectedPlan"
      class="w-full h-14 bg-yellow-400 text-gray-900 font-semibold text-lg rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-400 transition-all duration-200 shadow-lg shadow-yellow-400/20"
    >
      Continuar
    </button>
  </div>
</template>