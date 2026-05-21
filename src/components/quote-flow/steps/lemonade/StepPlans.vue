<script setup>
const emit = defineEmits(['select-plan', 'next'])

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
        class="relative p-6 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col"
        :class="plan.popular
          ? 'border-[#00184C] bg-[#00184C] text-white shadow-xl shadow-[#00184C]/20 scale-105'
          : 'border-gray-200 bg-white hover:border-[#00184C] hover:bg-[#00184C] hover:text-white'"
      >
        <!-- Popular Badge -->
        <span
          v-if="plan.popular"
          class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F9D35A] text-[#00184C] text-xs font-bold rounded-full"
        >
          Popular
        </span>

        <!-- Plan Name -->
        <h3 class="font-semibold text-lg mb-2">{{ plan.name }}</h3>

        <!-- Price -->
        <div class="mb-4">
          <span class="text-3xl font-bold">${{ plan.price }}</span>
          <span class="text-sm opacity-80">USD</span>
        </div>

        <!-- Coverage -->
        <p class="text-sm opacity-70 mb-4">Cobertura {{ plan.coverage }}</p>

        <!-- Features -->
        <ul class="text-left space-y-2 flex-1">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4 shrink-0" :class="plan.popular ? 'text-[#F9D35A]' : 'text-[#00184C]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ feature }}
          </li>
        </ul>
      </button>
    </div>
  </div>
</template>