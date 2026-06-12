<script setup>
import { ref, computed, watch } from 'vue'
import ConversationalError from './ConversationalError.vue'

const emit = defineEmits(['proceed', 'update'])

const activeTab = ref(0)
const hasUnsavedChanges = ref(false)
const testField = ref('')

const tabs = [
  { id: 'trip', label: 'El Viaje', icon: '✈️' },
  { id: 'travelers', label: 'Viajeros', icon: '👥' },
  { id: 'plan', label: 'Tu Plan', icon: '🛡️' }
]

const tabIndicatorStyle = computed(() => {
  return {
    transform: `translateX(${activeTab.value * 100}%)`,
    width: `${100 / tabs.length}%`
  }
})

const buttonConfig = computed(() => {
  if (hasUnsavedChanges.value) {
    return {
      text: 'Actualizar datos',
      class: 'bg-amber-400 hover:bg-amber-500 shadow-lg shadow-amber-400/30'
    }
  }
  return {
    text: 'Ir a Pagar',
    class: 'bg-yellow-400 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20'
  }
})

watch(testField, (val) => {
  hasUnsavedChanges.value = val.length > 0
})

function handlePrimaryAction() {
  if (hasUnsavedChanges.value) {
    emit('update', { testField: testField.value })
    hasUnsavedChanges.value = false
  } else {
    emit('proceed')
  }
}

const sampleTripData = ref({
  origin: 'Colombia',
  destination: 'España',
  startDate: '15 Jun 2025',
  endDate: '30 Jun 2025',
  duration: '15 días'
})

const sampleTravelersData = ref([
  { name: 'María García', age: 32, type: 'Adulto' }
])

const samplePlanData = ref({
  name: 'Explorer',
  price: 40,
  coverage: '$50,000 USD',
  features: ['Emergencias médicas', 'Cancelación de viaje', 'Equipaje protegido']
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="relative">
        <nav class="flex">
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            @click="activeTab = index"
            class="flex-1 px-4 py-4 text-sm font-medium transition-colors duration-200 relative z-10"
            :class="activeTab === index ? 'text-cyan-600' : 'text-gray-500 hover:text-gray-700'"
          >
            <div class="flex items-center justify-center gap-2">
              <span>{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </div>
          </button>
        </nav>

        <div class="relative h-1 bg-gray-100">
          <div
            class="absolute h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-transform duration-300 ease-out"
            :style="tabIndicatorStyle"
          ></div>
        </div>
      </div>

      <div class="p-6 min-h-64">
        <Transition
          mode="out-in"
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="activeTab === 0" key="trip" class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div class="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                <span class="text-2xl">🌎</span>
              </div>
              <div class="flex-1">
                <p class="text-xs text-gray-500 uppercase tracking-wide">Ruta</p>
                <p class="font-semibold text-gray-900 text-lg">{{ sampleTripData.origin }} → {{ sampleTripData.destination }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 rounded-xl text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Salida</p>
                <p class="font-medium text-gray-800">{{ sampleTripData.startDate }}</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl text-center">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Regreso</p>
                <p class="font-medium text-gray-800">{{ sampleTripData.endDate }}</p>
              </div>
            </div>

            <div class="p-4 bg-cyan-50 rounded-xl border border-cyan-100 text-center">
              <p class="text-cyan-700 font-medium">{{ sampleTripData.duration }}</p>
            </div>
          </div>

          <div v-else-if="activeTab === 1" key="travelers" class="space-y-4">
            <div class="space-y-3">
              <div
                v-for="(traveler, index) in sampleTravelersData"
                :key="index"
                class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ traveler.name.charAt(0) }}</span>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-800">{{ traveler.name }}</p>
                  <p class="text-sm text-gray-500">{{ traveler.age }} años • {{ traveler.type }}</p>
                </div>
                <span class="text-cyan-500">✓</span>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <label class="block text-sm font-medium text-gray-600 mb-2">Nota para el viaje (opcional)</label>
              <input
                v-model="testField"
                type="text"
                placeholder="Ej: Necesito atención especial"
                class="w-full h-12 px-4 bg-white border-2 border-gray-200 rounded-xl focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all placeholder:text-gray-400"
              />
              <p v-if="hasUnsavedChanges" class="text-amber-600 text-xs mt-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Tienes cambios sin guardar
              </p>
            </div>
          </div>

          <div v-else-if="activeTab === 2" key="plan" class="space-y-4">
            <div class="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p class="text-sm text-cyan-400 font-medium">Plan seleccionado</p>
                  <h3 class="text-2xl font-bold">{{ samplePlanData.name }}</h3>
                </div>
                <div class="text-right">
                  <p class="text-3xl font-bold text-yellow-400">${{ samplePlanData.price }}</p>
                  <p class="text-sm text-gray-400">USD</p>
                </div>
              </div>

              <div class="flex items-center gap-2 p-3 bg-white/10 rounded-xl mb-4">
                <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span class="text-sm">Cobertura {{ samplePlanData.coverage }}</span>
              </div>

              <ul class="space-y-2">
                <li v-for="feature in samplePlanData.features" :key="feature" class="flex items-center gap-2 text-sm text-gray-300">
                  <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ feature }}
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <div class="relative">
      <ConversationalError
        :message="hasUnsavedChanges ? 'Guardamos tus cambios antes de continuar.' : ''"
        :visible="hasUnsavedChanges"
      />

      <button
        @click="handlePrimaryAction"
        class="w-full h-14 font-semibold text-lg rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        :class="buttonConfig.class"
      >
        {{ buttonConfig.text }}
      </button>
    </div>

    <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Pago 100% asistencia</span>
    </div>
  </div>
</template>