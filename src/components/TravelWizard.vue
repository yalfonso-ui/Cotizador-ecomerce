<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import LandingPage from './LandingPage.vue'
import StepOrigin from './steps/StepOrigin.vue'
import StepDestination from './steps/StepDestination.vue'
import StepDates from './steps/StepDates.vue'
import StepTravelerInfo from './steps/StepTravelerInfo.vue'
import TravelersAgeStep from './steps/TravelersAgeStep.vue'
import StepPlans from './steps/StepPlans.vue'
import DataStep from './steps/DataStep.vue'
import StepCheckout from './steps/StepCheckout.vue'
import SuccessStep from './steps/SuccessStep.vue'

const showLanding = ref(true)
const showWizard = ref(false)
const currentStep = ref(0)
const direction = ref('left')

const formData = ref({
  origin: null,
  destination: null,
  dates: { start: null, end: null },
  travelers: null,
  travelerAges: [],
  companionNames: [],
  birthdates: [],
  selectedPlan: null,
  personalData: { name: '', email: '', phone: '' },
  emergencyContact: { name: '', phone: '', email: '' }
})

const TOTAL_STEPS = 9
const progress = computed(() => ((currentStep.value) / (TOTAL_STEPS - 1)) * 100)

const planPrices = { essential: 25, explorer: 40, premium: 65 }
const planNames = { essential: 'Essential', explorer: 'Explorer', premium: 'Premium' }

function getPlanPrice() {
  return planPrices[formData.value.selectedPlan] || 0
}

function getPlanName() {
  return planNames[formData.value.selectedPlan] || ''
}

const stepTitles = [
  { title: '¿Desde dónde viajas?', subtitle: 'Selecciona tu país de origen' },
  { title: '¿A dónde viajas?', subtitle: 'Selecciona tus destinos' },
  { title: '¿Cuándo es tu aventura?', subtitle: 'Selecciona las fechas de tu viaje' },
  { title: '¿Quiénes viajan?', subtitle: 'Selecciona el tipo de viaje' },
  { title: '¿Qué edad tienen los viajeros?', subtitle: 'Ingresa las edades' },
  { title: 'Elige tu plan de protección', subtitle: 'Compara los planes disponibles' },
  { title: 'Tus datos de contacto', subtitle: 'Titular y emergencia' },
  { title: 'Revisa y paga', subtitle: 'Confirma los detalles y completa el pago' },
  { title: '¡Viaje confirmado!', subtitle: 'Tu seguro está activo' }
]

function handleStart() {
  showLanding.value = false
  setTimeout(() => {
    showWizard.value = true
  }, 300)
}

function nextStep(data = {}) {
  formData.value = { ...formData.value, ...data }
  direction.value = 'left'
  currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0) {
    direction.value = 'right'
    currentStep.value--
  }
}

function goToStep(step) {
  if (step >= 0 && step < TOTAL_STEPS) {
    direction.value = step < currentStep.value ? 'right' : 'left'
    currentStep.value = step
  }
}

function handlePaymentSuccess(data) {
  clearWizardState()
  direction.value = 'left'
  currentStep.value = 8
}

function restart() {
  showWizard.value = false
  currentStep.value = 0
  formData.value = {
    origin: null,
    destination: null,
    dates: { start: null, end: null },
    travelers: null,
    travelerAges: [],
    companionNames: [],
    birthdates: [],
    selectedPlan: null,
    personalData: { name: '', email: '', phone: '' },
    emergencyContact: { name: '', phone: '', email: '' }
  }
  setTimeout(() => {
    showLanding.value = true
  }, 300)
}

watch(currentStep, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

watch([formData, currentStep], () => {
  localStorage.setItem('wizard_state', JSON.stringify({
    formData: formData.value,
    currentStep: currentStep.value
  }))
}, { deep: true })

onMounted(() => {
  const saved = localStorage.getItem('wizard_state')
  if (saved) {
    try {
      const state = JSON.parse(saved)
      if (state.formData) {
        formData.value = { ...formData.value, ...state.formData }
      }
      if (typeof state.currentStep === 'number' && state.currentStep > 0 && state.currentStep < TOTAL_STEPS) {
        currentStep.value = state.currentStep
        showLanding.value = false
        showWizard.value = true
      }
    } catch (e) {
      console.warn('Failed to restore wizard state:', e)
    }
  }
})

function clearWizardState() {
  localStorage.removeItem('wizard_state')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

    <Transition name="fade">
      <div v-if="showWizard" class="min-h-screen flex flex-col">
        <header class="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4">
          <div class="max-w-5xl mx-auto">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <img src="@/assets/images/uploads/Logotipo PNG.png" alt="Continental Assist Logo" class="h-10 w-auto" />
              </div>
              <div class="flex items-center gap-3">
                <span v-if="currentStep === 8" class="text-sm font-medium text-green-500">¡Completado!</span>
                <span v-else class="text-xs font-semibold text-[#00184C] bg-slate-100 px-3 py-1.5 rounded-full">
                  Paso {{ currentStep + 1 }} de {{ TOTAL_STEPS }}
                </span>
              </div>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                class="h-full bg-gradient-to-r from-[#00184C] to-[#00D1FF] rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/30"
                :style="{ width: progress + '%' }"
              />
            </div>
          </div>
        </header>

        <main class="flex-1 flex items-start justify-center px-4 py-8">
          <div class="w-full max-w-5xl">
            <Transition :name="'slide-' + direction" mode="out-in">
              <div :key="currentStep" class="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                <div v-if="currentStep !== 8" class="text-center mb-8">
                  <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                    <span class="text-3xl">{{ ['🌎', '✈️', '📅', '👥', '🎂', '🛡️', '👤', '💳', '✅'][currentStep] }}</span>
                  </div>
                  <h2 class="text-2xl font-semibold text-gray-900 mb-2">{{ stepTitles[currentStep].title }}</h2>
                  <p class="text-gray-500 text-sm">{{ stepTitles[currentStep].subtitle }}</p>
                </div>

                <div v-if="currentStep === 0">
                  <StepOrigin @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 1">
                  <StepDestination @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 2">
                  <StepDates @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 3">
                  <StepTravelerInfo :modelValue="formData" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 4">
                  <TravelersAgeStep :modelValue="formData" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 5">
                  <StepPlans v-model="formData.selectedPlan" @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 6">
                  <DataStep @next="nextStep" />
                </div>
                <div v-else-if="currentStep === 7">
                  <StepCheckout :data="formData" @go-to-step="goToStep" @payment-success="handlePaymentSuccess" />
                </div>
                <div v-else-if="currentStep === 8">
                  <SuccessStep 
                    :formData="formData"
                    :selectedPlan="{ name: getPlanName(), price: getPlanPrice() }"
                    @restart-flow="restart"
                  />
                </div>
              </div>
            </Transition>
          </div>
        </main>

        <footer v-if="currentStep > 0 && currentStep < 8" class="bg-white border-t border-gray-100 px-4 py-4 sticky bottom-0 z-50">
          <div class="max-w-2xl mx-auto flex justify-center">
            <button @click="prevStep" class="text-gray-500 hover:text-[#00184C] text-sm font-medium flex items-center gap-1 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Atrás
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
