<script setup>
import StepButton from '../../ui/StepButton.vue'

const emit = defineEmits(['select-plan'])

const plans = [
  {
    id: 'essential',
    name: 'Essential',
    price: 25,
    coverage: '$30,000 USD',
    features: [
      'Cobertura médica básica',
      'Asistencia en viaje 24/7',
      'Repatriación médica',
      'Equipaje protegido'
    ],
    color: '#43D3FF',
    badge: null
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 40,
    coverage: '$50,000 USD',
    badge: 'POPULAR',
    features: [
      'Todo lo de Essential',
      'Cancelación de viaje',
      'Cobertura COVID-19',
      'Deportes de aventura',
      'Odontología urgente'
    ],
    color: '#00184C',
    highlighted: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 65,
    coverage: '$100,000 USD',
    features: [
      'Todo lo de Explorer',
      'Concierge 24/7',
      'Cobertura para mascotas',
      'Sport extremos',
      'Segunda opinión médica'
    ],
    color: '#F9D35A',
    badge: null
  }
]

function handleSelect(plan) {
  emit('select-plan', plan)
}
</script>

<template>
  <div class="space-y-6">
    <div class="text-center mb-8">
      <h2 class="font-heading text-2xl md:text-3xl font-semibold text-[#00184C] mb-2">
        Elige tu plan de protección
      </h2>
      <p class="text-gray-500">Coberturas diseñadas para cada tipo de aventurero</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:-translate-y-1"
        :class="plan.highlighted 
          ? 'border-[#43D3FF] shadow-xl ring-4 ring-[#43D3FF]/20 md:scale-105' 
          : 'border-gray-200 hover:border-[#43D3FF] hover:shadow-lg'"
      >
        <div v-if="plan.badge" class="absolute top-0 left-0 right-0 bg-[#43D3FF] text-white text-center py-2 text-xs font-bold uppercase tracking-wide">
          {{ plan.badge }}
        </div>

        <div class="p-6" :class="plan.badge ? 'pt-10' : ''">
          <h3 class="font-heading text-xl font-bold text-[#00184C] mb-1">
            {{ plan.name }}
          </h3>
          
          <div class="mb-4">
            <span class="text-4xl font-bold" :style="{ color: plan.color }">
              ${{ plan.price }}
            </span>
            <span class="text-gray-400 text-sm">/USD</span>
          </div>

          <div class="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-center">
            <span class="text-sm font-medium text-[#00184C]">
              Cobertura: {{ plan.coverage }}
            </span>
          </div>

          <ul class="space-y-2 mb-6">
            <li 
              v-for="(feature, index) in plan.features" 
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-600"
            >
              <svg class="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>

          <button
            @click="handleSelect(plan)"
            class="w-full py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#43D3FF]/30"
            :class="plan.highlighted
              ? 'bg-[#00184C] text-white hover:bg-[#00133D]'
              : 'bg-gray-100 text-[#00184C] hover:bg-gray-200'"
          >
            Seleccionar {{ plan.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>