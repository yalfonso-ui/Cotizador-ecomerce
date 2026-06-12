<script setup>
import { ref } from 'vue'
import PlanCompareModal from '@/components/ui/PlanCompareModal.vue'

const emit = defineEmits(['update', 'next'])

const props = defineProps({
  modelValue: String
})

const selectedPlan = ref(props.modelValue)
const isCompareModalOpen = ref(false)

const plans = [
  {
    id: 'premium',
    name: 'Premium',
    price: 65,
    anchorPrice: 89,
    coverage: '$100,000 USD',
    features: ['Todo de Explorer', 'Asistencia de actividades', 'Mayores límites', 'Concierge personal', 'Cobertura familiar'],
    popular: false
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 40,
    anchorPrice: 59,
    coverage: '$50,000 USD',
    features: ['Todo de Essential', 'Cancelación de viaje', 'Equipaje protegido', 'COVID-19 incluido', 'Asistencia 24/7'],
    popular: true
  },
  {
    id: 'essential',
    name: 'Essential',
    price: 25,
    anchorPrice: null,
    coverage: '$15,000 USD',
    features: ['Emergencias médicas', 'Repatriación básica', 'Teleconsulta 24/7', 'COVID-19'],
    popular: false
  }
]

function selectPlan(plan) {
  selectedPlan.value = plan.id
  emit('update:modelValue', plan.id)
}

function openCompare() {
  isCompareModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6 pb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <button
        v-for="plan in plans"
        :key="plan.id"
        @click="selectPlan(plan)"
        class="relative p-5 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col min-h-[320px]"
        :class="(selectedPlan === plan.id)
          ? 'border-[#00184C] ring-4 ring-[#00184C]/20 bg-[#00184C]/5 shadow-lg'
          : (plan.popular)
          ? 'border-[#00D1FF] bg-white shadow-lg hover:border-[#00184C] hover:ring-4 hover:ring-[#00184C]/20'
          : 'border-gray-200 bg-white hover:border-[#00184C] hover:ring-4 hover:ring-[#00184C]/20'"
      >
        <span
          v-if="plan.popular"
          class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00184C] text-white text-xs font-bold rounded-full shadow-lg"
        >
          ⭐ Más popular
        </span>

        <div class="flex items-center justify-center mb-3 mt-2">
          <div v-if="selectedPlan === plan.id" class="w-6 h-6 rounded-full bg-[#00184C] flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 class="font-bold text-xl mb-2" :class="selectedPlan === plan.id ? 'text-[#00184C]' : 'text-slate-900'">{{ plan.name }}</h3>

        <div class="mb-3">
          <span v-if="plan.anchorPrice" class="text-lg text-gray-400 line-through mr-2">${{ plan.anchorPrice }}</span>
          <span class="text-4xl font-extrabold" :class="selectedPlan === plan.id ? 'text-[#00184C]' : 'text-slate-900'">${{ plan.price }}</span>
          <span class="text-sm opacity-60 ml-1">USD</span>
        </div>
        <div v-if="plan.anchorPrice" class="text-xs font-semibold text-green-500 mb-2">Ahorras ${{ plan.anchorPrice - plan.price }} USD</div>

        <p class="text-sm opacity-70 mb-4">Cobertura {{ plan.coverage }}</p>

        <ul class="text-left space-y-1.5 flex-1">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-start gap-2 text-sm"
            :class="selectedPlan === plan.id ? 'text-[#00184C]' : 'text-gray-600'"
          >
            <svg class="w-4 h-4 shrink-0 mt-0.5" :class="selectedPlan === plan.id ? 'text-[#00D1FF]' : 'text-[#00D1FF]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>
      </button>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
      <button
        type="button"
        @click="openCompare"
        class="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 active:scale-[0.98] rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Ver detalles
      </button>

      <button
        @click="emit('next', { selectedPlan: selectedPlan })"
        :disabled="!selectedPlan"
        class="w-full sm:w-auto min-w-[250px] px-8 py-3.5 bg-yellow-400 text-slate-900 font-extrabold rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
      >
        Elegir {{ plans.find(p => p.id === selectedPlan)?.name || 'este plan' }}
      </button>
    </div>

    <PlanCompareModal
      v-model="isCompareModalOpen"
      :plans="plans"
      :selectedPlanId="selectedPlan"
    />
  </div>
</template>
